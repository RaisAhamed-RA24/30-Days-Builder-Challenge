# API Playground – Your Mini Postman

A lightweight API testing tool built with React that allows developers to send HTTP requests, configure parameters and headers, submit JSON data, and inspect API responses — all from a simple web interface.

## 🚀 Features

- **HTTP Methods:** Support for GET, POST, PUT, PATCH, and DELETE.
- **URL Input:** Enter API endpoint URLs.
- **Query Parameters:** Add query parameters to API requests.
- **Custom Headers:** Configure request headers using JSON.
- **JSON Request Body:** Send JSON data with POST, PUT, and PATCH requests.
- **Response Viewer:** Display API responses in formatted JSON or text.
- **Status Codes:** View HTTP response status codes.
- **Response Time:** Measure request duration in milliseconds.
- **Request History:** Automatically save recent requests using LocalStorage.
- **Reuse Requests:** Select previous requests from history.
- **Clear Response:** Reset the response panel.
- **Responsive Interface:** Use the application on desktop and mobile devices.

## 🛠️ Tech Stack

| Technology   | Purpose                       |
| ------------ | ----------------------------- |
| React        | User interface development    |
| Vite         | Development environment       |
| JavaScript   | Application functionality     |
| CSS3         | Styling and responsive design |
| Fetch API    | Sending HTTP requests         |
| LocalStorage | Saving request history        |

## 📸 Application Preview

Add screenshots of your application here.

```text
screenshots/
├── home.png
├── request-builder.png
└── response-view.png
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd api-playground
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Visit the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🧪 Testing

The application was tested using [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API for testing and prototyping.

Tested functionality:

- GET requests
- POST requests
- Query parameters
- Custom headers
- JSON request bodies
- Response status and timing
- Request history persistence

## 📂 Project Structure

```text
api-playground/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── package-lock.json
```

## 💾 Data Storage

Request history is stored in the browser using LocalStorage.

- History remains available after refreshing the page.
- The application stores up to 20 recent successful HTTP responses.
- History is stored locally in the browser, not in a cloud database.

## ⚠️ Limitations

- Some APIs may block browser requests because of Cross-Origin Resource Sharing (CORS) restrictions.
- Request history is browser-specific.
- API credentials and sensitive tokens should not be entered into public or shared environments.
- The current application does not include backend proxy support.

## 🔮 Future Improvements

- Authentication and saved workspaces.
- Environment variables.
- Advanced query parameter editor.
- Import and export API collections.
- Request collections and folders.
- Backend proxy for APIs with CORS restrictions.
- API response visualization.
- Dark and light themes.

## 👨‍💻 Developer

**Rais Ahamed - RA24**

Built as part of the **30-Day Builder Challenge**.

## 📌 Challenge Information

- Challenge: 30-Day Builder Challenge
- Project: 04 / 30
- Project Name: API Playground
- Category: Web Development
- Status: Completed

---

**Build. Test. Explore APIs.** 🚀
