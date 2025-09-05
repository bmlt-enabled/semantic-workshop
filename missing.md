Missing Parameters in GetSearchResults:

1. Meeting ID Filtering - Not implemented:
•  meeting_ids={id} - Include specific meeting IDs
•  meeting_ids[]={id} - Multiple meeting IDs (array format)
•  meeting_ids=-{id} - Exclude specific meeting IDs
•  meeting_ids[]=-{id} - Exclude multiple meeting IDs (array format)
2. Published Status Filtering - Not implemented:
•  advanced_published=1 - Show only published meetings
•  advanced_published=0 - Show only unpublished meetings
•  advanced_published={other} - Show all meetings (default)
3. Pagination - Not implemented:
•  page_size={number} - Number of results per page
•  page_num={number} - Page number (defaults to 1)
4. Language Support for Results - Not implemented:
•  lang_enum={language_code} - Language for format names in results
5. Distance Sorting - Not implemented:
•  sort_results_by_distance=1 - Sort results by distance when using geographic search
6. Recursive Service Bodies - Not implemented (as you suspected):
•  recursive=1 - Include child service bodies when filtering by services

Missing Parameters in GetFormats:

1. Format ID Filtering - Not implemented:
•  format_ids - Array of format IDs to include/exclude (positive to include, negative to exclude)
2. Key String Filtering - Not implemented:
•  key_strings - Array of format key strings to filter by

Missing Parameters in GetServiceBodies:

The entire GetServiceBodies endpoint functionality is not implemented - it's currently handled by the GetOther component which has no parameters. The documentation shows these parameters should be available:
•  services - Array of service body IDs to include/exclude
•  recursive - Set to '1' to include child service bodies  
•  parents - Set to '1' to include parent service bodies

Aggregator Mode Parameters:

If the server supports aggregator mode, these are missing:
•  root_server_ids={id} - Include specific root server IDs
•  root_server_ids[]={id} - Multiple root server IDs
•  root_server_ids=-{id} - Exclude specific root server IDs
•  root_server_ids[]=-{id} - Exclude multiple root server IDs

Recommendations:

You are correct about the recursive checkbox - it's not implemented. This is probably the most important missing feature since it affects service body filtering in GetSearchResults.

The highest priority missing features I'd recommend implementing are:

1. [x] done Recursive checkbox for service bodies in GetSearchResults
2. [x] done Meeting ID filtering (useful for specific searches)
3. [x] done Published status filtering (important for administrative use)
4. Pagination support (important for large result sets)
5. [x] done A proper GetServiceBodies component with its own parameters
