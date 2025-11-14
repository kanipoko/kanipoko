#!/usr/bin/env python3
"""Test script to explore Eurostat datasets"""

import eurostat
import pandas as pd

print("Testing Eurostat package...")
print("="*60)

# Try to get table of contents
try:
    print("\n1. Getting table of contents...")
    toc_df = eurostat.get_toc_df()
    print(f"Found {len(toc_df)} datasets")

    # Search for labour cost datasets
    print("\n2. Searching for labour cost datasets...")
    labour_datasets = toc_df[toc_df['title'].str.contains('labour cost', case=False, na=False)]
    print(f"\nFound {len(labour_datasets)} labour cost datasets:")
    print(labour_datasets[['code', 'title']].to_string())

    # Search specifically for lc_lci
    print("\n3. Searching for 'lc_lci' datasets...")
    lci_datasets = toc_df[toc_df['code'].str.contains('lc_lci', case=False, na=False)]
    print(lci_datasets[['code', 'title']].to_string())

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
