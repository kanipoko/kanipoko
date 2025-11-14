#!/usr/bin/env python3
"""
Eurostat Labour Cost Extractor for Automobile Manufacturers

This script extracts labour cost data for automobile manufacturers (NACE C29)
from Eurostat's lc_lci_r2_q dataset (quarterly labour cost index).

NACE C29: Manufacture of motor vehicles, trailers and semi-trailers
"""

import pandasdmx as sdmx
import pandas as pd
from datetime import datetime


def download_dataset_for_nace(nace_code='C29', start_year=2015):
    """
    Download labour cost data from Eurostat using SDMX protocol

    Args:
        nace_code: NACE Rev. 2 code (default: C29 for motor vehicles)
        start_year: Starting year for data (default: 2015)

    Returns:
        pandas.DataFrame: Labour cost data
    """
    print(f"Connecting to Eurostat SDMX service...")

    try:
        # Create connection to Eurostat
        # Note: SSL verification is disabled due to certificate issues in some environments
        import requests
        session = requests.Session()
        session.verify = False  # Disable SSL verification

        # Suppress SSL warnings
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        print("⚠ Warning: SSL verification is disabled for this connection")

        estat = sdmx.Request('ESTAT', session=session)

        print(f"Requesting data for NACE {nace_code} from {start_year}...")

        # Request data with filter for NACE C29
        # Use key parameter to filter by NACE code
        response = estat.data(
            'lc_lci_r2_q',
            key={'nace_r2': nace_code},  # Filter for specific NACE code
            params={'startPeriod': str(start_year)}  # Filter by start year
        )

        print("Converting SDMX data to pandas DataFrame...")

        # Convert to pandas DataFrame
        df = sdmx.to_pandas(response)

        return df

    except Exception as e:
        print(f"Error downloading data: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_automobile_labour_cost(start_year=2015):
    """
    Extract labour cost data for automobile manufacturers

    Args:
        start_year: Starting year for data extraction (default: 2015)

    Returns:
        pandas.DataFrame: Labour cost data for automobile manufacturers
    """
    print("\n" + "="*60)
    print(f"Extracting labour cost data for NACE C29 (Motor vehicles)")
    print(f"Start year: {start_year}")
    print("="*60 + "\n")

    try:
        # Download data using SDMX
        data = download_dataset_for_nace(nace_code='C29', start_year=start_year)

        if data is None or (isinstance(data, pd.DataFrame) and data.empty):
            print("✗ Failed to download data or no data available")
            return None

        print(f"✓ Successfully downloaded data")

        # Convert to DataFrame if it's a Series
        if isinstance(data, pd.Series):
            print("Converting Series to DataFrame...")
            data = data.to_frame()

        # Reset index to make multi-index columns accessible
        if isinstance(data.index, pd.MultiIndex):
            print("Resetting multi-index...")
            data = data.reset_index()

        print(f"Data shape: {data.shape}")
        print(f"Columns: {list(data.columns)}")

        # Display sample data
        print("\nFirst few rows:")
        print(data.head(10))

        # Display summary statistics
        if 'geo' in str(data.columns).lower() or 'GEO' in str(data.columns):
            geo_cols = [col for col in data.columns if 'geo' in str(col).lower()]
            if geo_cols:
                print(f"\nCountries/regions in dataset ({geo_cols[0]}):")
                print(data[geo_cols[0]].unique())

        return data

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def save_data(data, filename=None):
    """
    Save extracted data to CSV file

    Args:
        data: pandas.DataFrame to save
        filename: Output filename (optional)
    """
    if data is None or data.empty:
        print("No data to save")
        return

    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"automobile_labour_cost_{timestamp}.csv"

    try:
        data.to_csv(filename, index=False)
        print(f"\n✓ Data saved to: {filename}")
    except Exception as e:
        print(f"✗ Error saving data: {e}")


def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("Eurostat Labour Cost Extractor")
    print("Target: Automobile Manufacturers (NACE C29)")
    print("="*60)

    # Extract data
    print("\n[Step 1] Extracting labour cost data...")
    data = extract_automobile_labour_cost(start_year=2015)

    # Save data
    if data is not None and not data.empty:
        print("\n[Step 2] Saving data...")
        save_data(data, "automobile_labour_cost.csv")

        print("\n" + "="*60)
        print("Extraction complete!")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("Extraction failed - no data retrieved")
        print("="*60 + "\n")


if __name__ == "__main__":
    main()
