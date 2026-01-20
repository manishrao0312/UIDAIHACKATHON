import pandas as pd
import glob
import xgboost as xgb
import json
import os


def load_csv_folder(path, label):
    files = glob.glob(path)
    print(f"{label} FILES FOUND:", files)

    if not files:
        raise FileNotFoundError(f"No CSV files found for {label} at {path}")

    return pd.concat(
        [pd.read_csv(f, low_memory=False) for f in files],
        ignore_index=True
    )


def fuse_and_train():
    # -------------------------------------------------
    # 1. Paths (CSV + nested folders)
    # -------------------------------------------------
    path_demo = r"C:\Users\DELL\Downloads\api_data_aadhar_demographic\api_data_aadhar_demographic\*.csv"

    # -------------------------------------------------
    # 2. Load demographic data
    # -------------------------------------------------
    df = load_csv_folder(path_demo, "DEMO")

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower()

    # -------------------------------------------------
    # 3. Validate required columns (REAL ones)
    # -------------------------------------------------
    required_cols = {
        "date",
        "district",
        "pincode",
        "demo_age_5_17",
        "demo_age_17_"
    }

    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # -------------------------------------------------
    # 4. Date → Month
    # -------------------------------------------------
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    df["month"] = df["date"].dt.to_period("M").astype(str)

    # -------------------------------------------------
    # 5. Migration proxy (PIN change over time)
    # -------------------------------------------------
    df = df.sort_values(["district", "month"])

    df["is_migration"] = (
        df.groupby("district")["pincode"]
        .transform(lambda x: x != x.shift(1))
        .fillna(0)
        .astype(int)
    )

    # -------------------------------------------------
    # 6. Feature Engineering (age buckets)
    # -------------------------------------------------
    features = (
        df
        .groupby(["district", "month"])
        .agg(
            migration_events=("is_migration", "sum"),
            age_5_17=("demo_age_5_17", "sum"),
            age_17_plus=("demo_age_17_", "sum")
        )
        .reset_index()
    )

    # Encode month numerically for ML
    features["month_idx"] = pd.factorize(features["month"])[0]

    # -------------------------------------------------
    # 7. XGBoost Training
    # -------------------------------------------------
    X = features[["age_5_17", "age_17_plus", "month_idx"]]
    y = features["migration_events"]

    model = xgb.XGBRegressor(
        objective="reg:squarederror",
        n_estimators=120,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )

    model.fit(X, y)

    # -------------------------------------------------
    # 8. Export Results
    # -------------------------------------------------
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)

    master_data = {
        "historical": features.to_dict(orient="records"),
        "predictions_next_period": model.predict(X).tolist()
    }

    with open("data/migration_master.json", "w") as f:
        json.dump(master_data, f, indent=2)

    model.save_model("models/xgboost_migration_model.json")

    print("✅ Data fusion and migration model training completed successfully.")


if __name__ == "__main__":
    fuse_and_train()
