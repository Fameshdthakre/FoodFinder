# Restaurant Recommendation App

This is a full-stack web application that provides restaurant recommendations. Users can search for restaurants based on various criteria such as cuisine, price range, and location. The application displays results both in a list format and on an interactive map, with rankings influenced by user ratings, price affordability, and sentiment analysis of reviews.

## Features

*   **Search and Filter:** Users can search for restaurants and filter them by:
    *   Cuisine type
    *   Price level
    *   Location (latitude, longitude, and radius)
    *   Overall rating
    *   Dietary preferences (e.g., vegan, vegetarian)
*   **Interactive Map View:** Restaurant locations are displayed on an interactive map (Mapbox).
*   **Restaurant Cards:** Search results are shown as cards with details like name, rating, price tier, sentiment score, and address.
*   **Recommendation Algorithm:** Restaurants are ranked based on a weighted score considering:
    *   User ratings (40%)
    *   Price tiers (lower is better - 30%)
    *   Sentiment scores from reviews (30%)
*   **Sortable Results:** Users can sort the restaurant list by rating, price, or distance.
*   **User Preferences:** The system can store and retrieve user-specific preferences (e.g., favorite cuisines, preferred price range).
*   **User Interactions:** Tracks user interactions like viewing a restaurant, marking it as a favorite, or noting a visit.
*   **CSV Data Upload:** Restaurant data can be uploaded/updated via CSV files.
*   **Sentiment Analysis:** Review sentiment is pre-calculated (using Python's `vaderSentiment`) and stored with restaurant data.

## Technology Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   Vite (build tool)
    *   React Query (data fetching and caching)
    *   Mapbox GL JS (for interactive maps)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   TypeScript
*   **Database:**
    *   PostgreSQL
    *   Drizzle ORM
*   **Sentiment Analysis:**
    *   Python (`vaderSentiment` library) - Used for pre-processing review data.
*   **Development Environment:**
    *   Replit

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn)
*   Python and pip (for sentiment analysis pre-processing, if running manually)
*   Access to a PostgreSQL instance
*   A Mapbox API key (if you want to use the map features)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Install client dependencies:**
    The client dependencies are included in the main `package.json`. Running `npm install` in the root should cover them.

4.  **Environment Variables:**
    Create a `.env` file in the root of the project or configure environment variables directly in your deployment environment (e.g., Replit secrets). You'll need to set the following:
    *   `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database`)
    *   `MAPBOX_TOKEN`: Your Mapbox API access token (for the client-side map)

    *Note: The Replit environment might handle some of these automatically if using Replit's DB integration.*

### Running the Application

1.  **Start the backend server:**
    From the root directory:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This typically starts the server (often using `vite` for the backend as well, as suggested by `server/vite.ts`) and the client development server concurrently. Check your `package.json` scripts for the exact command. By default, the server might run on port 3001 and the client on port 5173.

2.  **Access the application:**
    Open your browser and navigate to the client URL (usually `http://localhost:5173` or the URL provided by Replit).

## Database Setup

The application uses a PostgreSQL database. The schema is managed using Drizzle ORM.

1.  **Ensure PostgreSQL is running and accessible.**

2.  **Database Migrations:**
    The schema is defined in `shared/schema.ts`. To apply migrations and create the tables, you might use Drizzle Kit commands. Typically, this involves:
    ```bash
    npx drizzle-kit generate:pg # To generate SQL migration files based on schema changes
    npx drizzle-kit push:pg     # To apply the generated migrations to the database (can be destructive)
    # or use a more robust migration tool/workflow if preferred
    ```
    Refer to the Drizzle ORM documentation for detailed instructions on setting up and running migrations.

3.  **Data Upload:**
    *   Restaurant data is intended to be uploaded via CSV files.
    *   The project includes a Python script (implicitly, based on the project prompt for `vaderSentiment`) for pre-calculating sentiment scores for reviews before data upload. This script is not explicitly in the file listing but was part of the initial project requirements.
    *   There is a backend endpoint `/api/restaurants/upload-csv` (see `server/routes.ts`) that accepts a `POST` request with a CSV file to populate the `restaurants` table.
    *   The CSV should have columns matching the fields in the `restaurants` table schema (see `shared/schema.ts` and `server/routes.ts` for expected CSV structure). Key columns include: `name`, `rating`, `totalReviews`, `priceLevel`, `categories` (pipe-separated), `address`, `lat`, `lng`, `reviews` (pipe-separated), `sentimentScore`, `placeUrl`, `dietaryOptions` (pipe-separated), `popularDishes` (pipe-separated), `peakHours` (pipe-separated).

    **Example CSV structure:**
    ```csv
    name,rating,totalReviews,priceLevel,categories,address,lat,lng,reviews,sentimentScore,placeUrl,dietaryOptions,popularDishes,peakHours
    "Pizza Place",4.5,150,2,"Italian|Pizza","123 Main St",40.7128,-74.0060,"Great pizza!|Good service",0.85,"http://example.com/pizza","vegetarian","Pepperoni Pizza|Margherita Pizza","18:00-20:00"
    ```

## API Endpoints

The backend exposes the following RESTful API endpoints (defined in `server/routes.ts`):

*   **`GET /api/restaurants`**: Searches for restaurants.
    *   **Query Parameters:** Accepts various filters like `cuisine`, `maxPrice`, `minPrice`, `rating`, `lat`, `lng`, `radius`, `dietaryPreferences`, `userId`, `sortBy`.
    *   **Returns:** A JSON array of restaurant objects matching the filters.

*   **`GET /api/dietary-options`**: Retrieves available dietary options.
    *   **Returns:** A JSON object/array of dietary options (e.g., vegan, vegetarian).

*   **`GET /api/user-preferences/:userId`**: Fetches preferences for a specific user.
    *   **Path Parameter:** `userId` - The ID of the user.
    *   **Returns:** A JSON object with the user's saved preferences.

*   **`POST /api/user-preferences`**: Creates or updates user preferences.
    *   **Request Body:** A JSON object containing user preference data (e.g., `userId`, `dietaryPreferences`, `favoriteCategories`).
    *   **Returns:** The updated user preferences object.

*   **`POST /api/interactions`**: Records a user interaction with a restaurant.
    *   **Request Body:** A JSON object with `userId`, `restaurantId`, and `type` (e.g., 'view', 'favorite', 'visit').
    *   **Returns:** A success status.

*   **`POST /api/restaurants/upload-csv`**: Uploads restaurant data via a CSV file.
    *   **Request Type:** `multipart/form-data` with a single file field named `file`.
    *   **Returns:** A success status and the count of records processed.

## Future Improvements

*   **Automated Data Scraping:** Instead of manual CSV uploads, implement a scraper to automatically fetch and update restaurant data from relevant sources.
*   **Advanced Sentiment Analysis:** Use more sophisticated NLP models for sentiment analysis, potentially analyzing aspects of reviews (e.g., food quality, service).
*   **User Accounts and Authentication:** Implement full user accounts with secure authentication.
*   **Personalized Recommendations:** Enhance the recommendation algorithm using machine learning based on user interaction history and collaborative filtering.
*   **Real-time Location Updates:** For mobile users, offer real-time updates of nearby restaurants as they move.
*   **Admin Dashboard:** Create a dashboard for managing restaurants, users, and viewing analytics.
*   **More Sophisticated Filtering:** Add options like filtering by specific amenities (e.g., outdoor seating, Wi-Fi), or by restaurants open at a specific time.
*   **Write Tests:** Add unit and integration tests for both frontend and backend.
