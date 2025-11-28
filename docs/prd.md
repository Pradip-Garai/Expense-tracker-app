# MERN Expense Tracker Application Requirements Document

## 1. Project Overview
Build a production-ready, beautifully designed Expense Tracker application using the MERN stack (MongoDB, Express.js, React.js with Vite, Node.js) with complete financial management functionality.

## 2. Core Features

### 2.1 User Authentication & Authorization
- JWT-based authentication (access token + refresh token)
- Secure signup/login with password hashing (bcrypt)
- Protected routes for authenticated users only
- Email verification during signup (optional but recommended)
- Forgot password functionality with email reset link

### 2.2 Dashboard
- Summary cards showing:
  - Total balance (income - expenses)
  - Total income (current month)
  - Total expenses (current month)
  - Net savings rate
- Recent transactions table (last 5-10 transactions)
- Monthly spending trend chart
- Quick-add transaction form on dashboard

### 2.3 Transaction Management
**Add Transactions:**
- Form with fields: amount, description, category, date, type (income/expense), payment method
- Category dropdown with icons (Food, Transportation, Shopping, Healthcare, etc.)
- Recurring transaction option (daily, weekly, monthly)
- Receipt/image upload (cloud or local storage)

**View Transactions:**
- Filter by: date range, category, type, amount range
- Sort by: date, amount (asc/desc)
- Search by description
- Pagination (10-20 per page)

**Edit/Delete Transactions:**
- Edit existing transactions
- Delete with confirmation modal
- Bulk delete/editing options

### 2.4 Analytics & Reports
**Visual Charts:**
- Pie chart for expense categories
- Bar chart for monthly income vs expenses
- Line chart for spending trends over time
- Use Chart.js or Recharts for visualizations

**Report Generation:**
- Generate PDF reports (using pdfmake or jsPDF)
- Export to Excel/CSV (using xlsx library)
- Custom date range selection for reports
- Report types: monthly summary, category breakdown, cash flow\n
**Email Reports:**\n- Scheduled monthly reports via email
- Manual report sending option
- Email template with charts and summary

### 2.5 User Profile
- User details (name, email, profile picture)
- Account settings
- Currency preference (Indian Rupee₹)
- Monthly budget setting
- Category customization
- Notification preferences
- Profile picture upload (cloud storage)
- Change password functionality

### 2.6 Advanced Features
**Budget Management:**
- Set monthly budgets per category
- Budget progress bars with warnings
- Overspending alerts

**Goals & Savings:**
- Create saving goals
- Track progress toward goals
- Automatic allocation from income

**Notifications:**
- Browser notifications for large transactions
- Email alerts for budget limits
- Weekly spending summary

### 2.7 FD (Fixed Deposit) Module
- Daily deposit amount recording functionality
- FD account balance display
- Deposit history query
- Deposit statistics and trend analysis
- Support for editing and deleting deposit records

## 3. Technical Requirements

### 3.1 Backend (Node.js/Express)
- RESTful API structure
- MVC architecture\n- MongoDB with Mongoose ODM
- JWT authentication middleware
- File upload handling (Multer)
- Email service (Nodemailer)
- PDF/Excel generation libraries
- Input validation & sanitization
- Rate limiting & security headers
- Error handling middleware
- API documentation (Swagger/Postman)

### 3.2 Frontend (React with Vite)
- Component-based architecture
- React Router for navigation
- Context API or Redux for state management
- Axios for API calls
- Form handling with Formik & Yup validation
- Responsive design (mobile-first)
- UI Library: Material-UI or Tailwind CSS
- Charting: Chart.js/Recharts
- File download handling
- Toast notifications
- Loading states & skeletons
- Dark/light mode toggle

### 3.3 Database Schema (MongoDB)

**User Collection:**
```javascript
{\n  _id,
  name,
  email,\n  password,
  avatar,
  currency,
  createdAt
}
```

**Transaction Collection:**
```javascript
{\n  _id,
  userId,
  amount,\n  description,
  category,
  type: ['income', 'expense'],
  date,
  paymentMethod,
  recurring: Boolean,
  tags: [String],
  receipt: String,\n  createdAt
}\n```

**Category Collection:**
```javascript
{
  _id,
  userId,
  name,
  icon,
  color,
  type: ['income', 'expense'],
  budget: Number
}
```

**Budget Collection:**
```javascript
{\n  _id,
  userId,
  categoryId,
  amount,
  month,
  year,\n  spent: Number
}\n```

**Goal Collection:**
```javascript
{
  _id,
  userId,
  title,
  targetAmount,
  savedAmount,
  deadline,
  createdAt\n}
```

**FD Collection:**
```javascript
{
  _id,
  userId,
  amount,
  date,
  description,
  createdAt
}
```

## 4. UI/UX Requirements
- Clean, modern design with intuitive navigation
- Dashboard with visual metrics
- Color-coded transactions (red for expenses, green for income)
- Responsive design for all devices
- Loading animations and transitions
- Accessible components (ARIA labels, keyboard navigation)
- Consistent color scheme throughout
- Currency symbol unified as Indian Rupee (₹)

## 5. File Structure
```\nexpense-tracker/\n├── backend/
│   ├── controllers/
│   ├── models/\n│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/\n│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.jsx
│   └── vite.config.js
└── package.json
```

## 6. Environment Variables
```
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=\nEMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=
CLOUDINARY_URL=
```

## 7. Recommended Packages

**Backend:**
- express, mongoose, bcryptjs, jsonwebtoken
- multer, cloudinary, nodemailer
- pdfmake, exceljs, moment\n- cors, helmet, dotenv, express-rate-limit

**Frontend:**
- react, react-dom, react-router-dom
- axios, formik, yup
- chart.js, recharts, react-chartjs-2
- @mui/material or tailwindcss
- date-fns, react-hot-toast
- file-saver, jsPDF, xlsx

## 8. Implementation Priority
1. Set up project structure and basic Express server
2. MongoDB connection and schemas
3. User authentication (register/login)
4. Transaction CRUD operations
5. Dashboard with summary cards
6. Charts and visualizations
7. Report generation (PDF/Excel)
8. Email functionality
9. User profile\n10. FD (Fixed Deposit) module
11. Advanced features (budgets, goals)
12. UI/UX optimization
13. Testing and deployment

## 9. Deployment Instructions\n- Backend: Deploy to Render/Railway/AWS
- Frontend: Deploy to Vercel/Netlify
- Database: MongoDB Atlas
- File Storage: Cloudinary for image uploads

## 10. Design Style
- Color Scheme: Deep blue (#1976D2) as primary color, paired with light gray background (#F5F5F5) and white cards, green (#4CAF50) for income, red (#F44336) for expenses
- Visual Details: 8px border radius, soft shadow effects (02px 8px rgba(0,0,0,0.1)), linear icon style, smooth hover transition animations
- Overall Layout: Card-based layout, dashboard uses grid system, fixed left sidebar navigation, adaptive content area, bottom navigation bar for mobile devices