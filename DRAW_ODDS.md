# Ariona Big Game Draw Tools API Documentation

## Base URL
`/sitecore/v1`

## Authentication
All endpoints currently use `__return_true` for permission, meaning no strict authentication is implemented. In production, consider implementing proper authentication.

## Endpoints

### 1. Hunts Seasons
- **GET** `/hunts/rseasons`
  - Retrieves remote hunting seasons
  - Callback: `api_get_remote_seasons()`

### 2. Filters
- **GET** `/hunts/filters`
  - Retrieves available filters for hunts
  - Callback: `api_get_filters()`

### 3. Authentication
- **POST** `/hunts/auth`
  - Authenticate user
  - Required Parameters:
    - `email` (string, required)
    - `password` (string, required)
  - Callback: `api_hunts_auth()`

### 4. Hunts
#### Retrieve Hunts
- **GET** `/hunts`
  - Optional Query Parameters:
    - `state` (string): State ID
    - `weapon` (string): Weapon ID
    - `species` (string): Species ID
    - `points` (integer, default: 0): User points
    - `pointsType` (string, default: 'BONUS'): Points type (BONUS / PREFERENCE)
    - `resident` (boolean, default: false): Is resident hunter
    - `page` (integer, default: 1): Page number
    - `per_page` (integer, default: 10): Items per page
  - Callback: `api_get_hunts()`

#### Create/Update Hunt
- **POST/PUT** `/hunts`
  - Required Parameters:
    - `id` (string): Season ID (for update or insert)
    - `app_year` (integer)
    - `user_odds` (number)
    - `harvest_rate` (number)
    - `season_type` (string)
    - `start_date` (date string)
    - `end_date` (date string)
    - `hunters_per_sqmi` (number)
    - `weapon_id` (string)
    - `bag_type_id` (string)
    - `gmu_id` (string)
  - Optional Parameters:
    - `document_id` (string)
  - Callback: `api_save_hunt()`

#### Delete Hunt
- **DELETE** `/hunts`
  - Required Parameters:
    - `id` (string): Season ID to delete
  - Callback: `api_delete_hunt()`

### 5. Species
- **GET** `/species`: Retrieve species list
- **POST** `/species`: Create/Update species
- **DELETE** `/species`: Delete species
  - Required Parameter: `id` (string)
- Callback methods: `api_get_species()`, `api_save_simple()`, `api_delete_simple()`

### 6. Weapons
- **GET** `/weapons`: Retrieve weapons list
- **POST** `/weapons`: Create/Update weapons
- **DELETE** `/weapons`: Delete weapons
  - Required Parameter: `id` (string)
- Callback methods: `api_get_weapons()`, `api_save_simple()`, `api_delete_simple()`

### 7. States
- **GET** `/states`: Retrieve states list
- **POST** `/states`: Create/Update states
- **DELETE** `/states`: Delete states
  - Required Parameter: `id` (string)
- Callback methods: `api_get_states()`, `api_save_simple()`, `api_delete_simple()`

### 8. Bag Types
- **GET** `/bag_types`: Retrieve bag types list
- **POST** `/bag_types`: Create/Update bag types
- **DELETE** `/bag_types`: Delete bag types
  - Required Parameter: `id` (string)
- Callback methods: `api_get_bag_types()`, `api_save_simple()`, `api_delete_simple()`

### 9. Game Management Units (GMU)
- **GET** `/gmu`: Retrieve GMU list
- **POST** `/gmu`: Create/Update GMU
- **DELETE** `/gmu`: Delete GMU
  - Required Parameter: `id` (string)
- Callback methods: `api_get_gmu()`, `api_save_simple()`, `api_delete_simple()`

### 10. Documents
- **GET** `/documents`: Retrieve documents list
- **POST** `/documents`: Create/Update documents
- **DELETE** `/documents`: Delete documents
  - Required Parameter: `id` (string)
- Callback methods: `api_get_documents()`, `api_save_simple()`, `api_delete_simple()`

### 11. Applications
- **GET** `/applications`: Retrieve applications list
- **POST** `/applications`: Create/Update applications
- **DELETE** `/applications`: Delete applications
  - Required Parameter: `id` (integer)
- Callback methods: `api_get_applications()`, `api_save_simple()`, `api_delete_simple()`

### 12. Odds
- **GET** `/odds`: Retrieve odds list
- **POST** `/odds`: Create/Update odds
- **DELETE** `/odds`: Delete odds
  - Required Parameter: `id` (string)
- Callback methods: `api_get_odds()`, `api_save_simple()`, `api_delete_simple()`

### 13. Bulk Import
- **POST** `/hunts/bulk_import`
  - Required Parameter:
    - `csv_data` (string): CSV file content matching the template
  - Callback: `api_do_bulk_import()`

### 14. Sync
- **POST** `/{catalogue_table}/sync`
  - Sync a specific catalogue table
  - Callback: `api_catalogue_table_sync()`

