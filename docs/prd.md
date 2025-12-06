# MERN Expense Tracker Application Requirements Document

## 1. Project Overview
Build a production-ready, beautifully designed Expense Tracker application using the MERN stack (MongoDB, Express.js, React.js with Vite, Node.js) with complete financial management functionality and AI-powered financial planning capabilities.

## 2. Core Features
\n### 2.1 User Authentication & Authorization
- JWT-based authentication (access token + refresh token)
- Secure signup/login with password hashing (bcrypt)
- Protected routes for authenticated users only
- Email verification during signup (optional but recommended)
- Forgot password functionality with email reset link

### 2.2 Dashboard\n- Summary cards showing:
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
\n**View Transactions:**
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
**Email Reports:**
- Scheduled monthly reports via email
- Manual report sending option
- Email template with charts and summary

### 2.5 User Profile
- User details (name, email, profile picture)
- Account settings\n- Currency preference (Indian Rupee₹)
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
\n**Goals & Savings:**
- Create saving goals with target amount and deadline
- Track progress toward goals
- Automatic allocation from FD deposits to linked goals
- Display saved amount and remaining amount for each goal
- Progress bar showing completion percentage
- Update Progress button to manually adjust saved amount

**Notifications:**
- Browser notifications for large transactions
- Email alerts for budget limits
- Weekly spending summary\n\n### 2.7 FD (Fixed Deposit) Module
- Daily deposit amount recording functionality
- FD account balance display (total of all deposits)
- Deposit history query with date and amount
- Deposit statistics and trend analysis
- Support for editing and deleting deposit records
- **Automatic linkage to Goals page**: When a deposit is added to FD, it automatically updates the 'Saved' amount in the linked saving goal on the Goals page
- FD deposits contribute to goal progress tracking (e.g., ₹20deposit in FD adds ₹20 to goal's saved amount)

### 2.8 AI Financial Planning Agent
**Core Functionality:**
- Analyze user's long-term financial goals (car, house, flat, land purchase)
- Connect user goals, investment data, and market reference data
- Provide intelligent predictions and actionable recommendations
\n**Goal Input Fields:**
- Goal name (e.g., Car, Dream Flat, House, Land)\n- Target location (city/country, optional)
- Desired timeline (years or target date)
- Priority level (high / medium / low)
\n**Investment Data Integration:**
- Pull FD balance from FD module
- FD interest rate and maturity date
- Monthly saving contributions from transaction history
- Existing savings and cash balance from dashboard

**Market Data Estimation:**
- Current average price of the asset in selected area (estimated)
- Expected yearly inflation or appreciation rate
- Price range (minimum–maximum) for realistic scenarios
\n**AI Analysis & Predictions:**
- Estimate current market cost of selected asset
- Predict future cost at target timeline using inflation/appreciation assumptions
- Calculate projected savings at target date (FD growth + monthly contributions)
- Compare projected savings vs projected asset cost

**Goal Status Determination:**
- Achievable ✅ (savings meet or exceed projected cost)
- Partially achievable ⚠️ (savings cover50-99% of projected cost)
- Not achievable ❌ (savings below50% of projected cost)
\n**Progress Metrics Display:**
- Percentage of goal completed
- Shortfall or surplus amount in₹
- Time required to fully reach goal with current savings behavior

**Intelligent Recommendations:**
- Increase monthly savings amount (with suggested amount)
- Extend goal timeline (with alternative target dates)
- Improve investment returns (e.g., higher FD rate, SIP allocation suggestions)
- Reduce target size or choose alternative asset options

**Output Presentation:**
- Dream Progress Summary card with visual progress indicator
- Clear next action plan with prioritized steps
- Motivating, human-friendly tone throughout
- Simple language avoiding financial jargon

**Important Disclaimers:**
- No investment guarantees provided
- Use realistic assumptions based on historical data
- Treat as financial guidance, not professional advice
- Encourage users to consult financial advisors for major decisions
\n## 3. Technical Requirements

### 3.1 Backend (Node.js/Express)\n- RESTful API structure\n- MVC architecture\n- MongoDB with Mongoose ODM
- JWT authentication middleware
- File upload handling (Multer)
- Email service (Nodemailer)
- PDF/Excel generation libraries\n- Input validation & sanitization
- Rate limiting & security headers
- Error handling middleware
- API documentation (Swagger/Postman)
- **AI Agent Integration**: Node.js service for financial calculations and predictions

### 3.2 Frontend (React with Vite)
- Component-based architecture
- React Router for navigation
- Context API or Redux for state management
- Axios for API calls
- Form handling with Formik & Yup validation
- Responsive design (mobile-first)\n- UI Library: Material-UI or Tailwind CSS
- Charting: Chart.js/Recharts
- File download handling
- Toast notifications
- Loading states & skeletons
- Dark/light mode toggle
- **AI Planning Dashboard**: Dedicated page for AI financial planning with interactive goal cards

### 3.3 Database Schema (MongoDB)
\n**User Collection:**
```javascript
{
  _id,
  name,
  email,
  password,
  avatar,
  currency,
  createdAt\n}
```

**Transaction Collection:**
```javascript
{
  _id,
  userId,
  amount,
  description,
  category,
  type: ['income', 'expense'],
  date,
  paymentMethod,
  recurring: Boolean,
  tags: [String],
  receipt: String,
  createdAt
}
```
\n**Category Collection:**
```javascript
{
  _id,
  userId,
  name,
  icon,
  color,
  type: ['income', 'expense'],
  budget: Number\n}
```

**Budget Collection:**
```javascript
{
  _id,
  userId,
  categoryId,
  amount,\n  month,
  year,
  spent: Number\n}
```

**Goal Collection:**
```javascript
{
  _id,
  userId,
  title,
  targetAmount,
  savedAmount,
  deadline,\n  linkedToFD: Boolean,
  createdAt
}
```\n
**FD Collection:**
```javascript\n{
  _id,\n  userId,
  amount,
  date,
  description,
  linkedGoalId: ObjectId,
  createdAt
}
```
\n**AI Financial Goal Collection:**
```javascript
{
  _id,
  userId,
  goalName: String,
  assetType: ['car', 'house', 'flat', 'land', 'other'],
  targetLocation: String,
  timeline: Number,
  targetDate: Date,
  priorityLevel: ['high', 'medium', 'low'],
  currentMarketPrice: Number,
  projectedFuturePrice: Number,
  inflationRate: Number,
  projectedSavings: Number,\n  goalStatus: ['achievable', 'partially_achievable', 'not_achievable'],
  completionPercentage: Number,\n  shortfallAmount: Number,
  recommendations: [String],
  createdAt: Date,
  updatedAt: Date
}
```
\n## 4. UI/UX Requirements
- Clean, modern design with intuitive navigation
- Dashboard with visual metrics\n- Color-coded transactions (red for expenses, green for income)
- Responsive design for all devices
- Loading animations and transitions
- Accessible components (ARIA labels, keyboard navigation)
- Consistent color scheme throughout
- Currency symbol unified as Indian Rupee (₹)
- **AI Planning Interface**: Card-based layout with progress indicators, status badges (✅⚠️❌), and actionable recommendation buttons
- Reference images for UI design:\n  - image.png: Dashboard layout example
  - image-2.png: Transaction list view
\n## 5. File Structure
```
expense-tracker/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/\n│   ├── services/
│   │   └── aiFinancialPlanner.js\n│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/\n│   │   │   └── AIFinancialPlanning.jsx
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.jsx
│   └── vite.config.js
└── package.json
```
\n## 6. Environment Variables
```\nMONGODB_URI=\nJWT_SECRET=
JWT_REFRESH_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=
CLOUDINARY_URL=
```

## 7. Recommended Packages
\n**Backend:**
- express, mongoose, bcryptjs, jsonwebtoken\n- multer, cloudinary, nodemailer
- pdfmake, exceljs, moment
- cors, helmet, dotenv, express-rate-limit
\n**Frontend:**
- react, react-dom, react-router-dom\n- axios, formik, yup\n- chart.js, recharts, react-chartjs-2
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
9. User profile\n10. FD (Fixed Deposit) module with goal linkage
11. Goals & Savings module with FD integration
12. **AI Financial Planning Agent (backend service + frontend interface)**
13. Advanced features (budgets, notifications)\n14. UI/UX optimization
15. Testing and deployment

## 9. Deployment Instructions
- Backend: Deploy to Render/Railway/AWS
- Frontend: Deploy to Vercel/Netlify\n- Database: MongoDB Atlas\n- File Storage: Cloudinary for image uploads
\n## 10. Design Style\n- Color Scheme: Deep blue (#1976D2) as primary color, paired with light gray background (#F5F5F5) and white cards, green (#4CAF50) for income and achievable goals, red (#F44336) for expenses and unachievable goals, orange (#FF9800) for partially achievable goals
- Visual Details:8px border radius, soft shadow effects (02px 8px rgba(0,0,0,0.1)), linear icon style, smooth hover transition animations, status badges with rounded corners
- Overall Layout: Card-based layout, dashboard uses grid system, fixed left sidebar navigation, adaptive content area, bottom navigation bar for mobile devices, AI planning page uses vertical card stack with expandable sections