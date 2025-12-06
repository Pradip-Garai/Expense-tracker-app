# Expense Tracker - User Guide

## Getting Started

### 1. Create an Account
1. Click on "Sign Up" on the login page
2. Enter your name, email, and password
3. Click "Create Account"
4. You'll be automatically logged in

### 2. First Login
After creating your account, you'll be taken to the Dashboard where you can see:
- Your total balance (₹0.00 initially)
- Income and expenses for the current month
- A quick-add transaction form

## Using the Application

### Dashboard
The Dashboard is your financial overview:
- **Summary Cards**: View total balance, income, expenses, and savings rate
- **Recent Transactions**: See your last 10 transactions
- **Monthly Trend**: Visual chart showing spending over the past 6 months
- **Quick Add**: Quickly add a new transaction without leaving the dashboard

### Managing Transactions

#### Adding a Transaction
1. Click "Add Transaction" button (or use the quick-add form on dashboard)
2. Select transaction type (Income or Expense)
3. Enter the amount in rupees
4. Add a description (e.g., "Grocery shopping", "Salary")
5. Select a category from the dropdown
6. Choose the date
7. Optionally select a payment method
8. For recurring transactions, toggle the switch and select frequency
9. Click "Add" to save

#### Viewing Transactions
Navigate to the "Transactions" page to:
- See all your transactions in a paginated list
- Filter by type (Income/Expense)
- Filter by category
- Search by description
- View transaction details with category icons

#### Editing a Transaction
1. Find the transaction in the list
2. Click the edit icon (pencil)
3. Modify any fields
4. Click "Update" to save changes

#### Deleting a Transaction
1. Find the transaction in the list
2. Click the delete icon (trash)
3. Confirm the deletion in the popup

### Analytics & Reports

Navigate to the "Analytics" page to visualize your spending:

#### Expense by Category
- Pie chart showing percentage breakdown of expenses
- Color-coded by category
- Hover to see exact amounts

#### Monthly Income vs Expenses
- Bar chart comparing income and expenses for each month
- Helps identify spending patterns
- Select year to view different periods

#### Category Breakdown
- Detailed list of all expense categories
- Progress bars showing relative spending
- Percentage and amount for each category

**Tip**: Use the month and year selectors at the top to analyze different time periods.

### Budget Management

Set spending limits to control your finances:

#### Creating a Budget
1. Go to the "Budgets" page
2. Click "Add Budget"
3. Select a category (only expense categories)
4. Enter the budget amount
5. The budget applies to the selected month/year
6. Click "Create"

#### Monitoring Budgets
- **Overall Budget Card**: Shows total budget vs total spent
- **Category Cards**: Individual progress for each budget
- **Progress Bars**: Visual indicators of spending
- **Alerts**:
  - Yellow "Near Limit" badge when 80-100% spent
  - Red "Over Budget" badge when exceeding budget

#### Editing a Budget
1. Click the edit icon on a budget card
2. Modify the amount
3. Click "Update"

**Note**: You cannot change the category of an existing budget. Delete and create a new one if needed.

### Savings Goals

Track your progress towards financial goals:

#### Creating a Goal
1. Go to the "Goals" page
2. Click "Add Goal"
3. Enter a title (e.g., "Emergency Fund", "Vacation")
4. Set the target amount
5. Optionally set a deadline
6. Click "Create"

#### Updating Progress
1. Find your goal in the Active Goals section
2. Click "Update Progress"
3. Enter the new saved amount
4. Click "Update"
5. Goal automatically marks as completed when target is reached

#### Goal Status
- **Active Goals**: Goals you're currently working on
- **Completed Goals**: Goals that have reached 100% of target
- **Overdue**: Goals past their deadline (shown in red)

### Fixed Deposits (FD)

Track your fixed deposit investments:

#### Adding a Deposit
1. Go to the "Fixed Deposits" page
2. Click "Add Deposit"
3. Enter the deposit amount
4. Select the date
5. Optionally add a description
6. Click "Add"

#### Viewing FD Balance
- The total FD balance is displayed prominently at the top
- Deposit history shows all your FD transactions
- Use pagination to navigate through older deposits

#### Managing Deposits
- Edit: Click the pencil icon to modify amount, date, or description
- Delete: Click the trash icon to remove a deposit record

### Profile Settings

Manage your account:

1. Go to the "Profile" page
2. Update your name
3. Set your monthly budget (overall spending limit)
4. Click "Save Changes"

**Note**: Email cannot be changed for security reasons.

#### Theme Toggle (Dark/Light Mode)

Switch between light and dark themes:

**Desktop:**
- Click the sun/moon icon in the top-right corner of the sidebar
- The theme will toggle instantly

**Mobile:**
- Go to the Profile page
- Find the "Appearance" section
- Toggle the Dark Mode switch
- Your preference is saved automatically

**Note**: Your theme preference is saved in your browser and will persist across sessions.

#### Signing Out
Click the "Sign Out" button at the bottom of the Profile page.

## Tips for Best Results

### 1. Regular Updates
- Add transactions daily for accurate tracking
- Update your goals weekly to stay motivated
- Review budgets at the start of each month

### 2. Use Categories Wisely
- System categories cover most needs
- Consistent categorization helps with analytics
- Use "Other" categories sparingly

### 3. Set Realistic Budgets
- Start with your actual spending patterns
- Gradually reduce budgets to save more
- Don't set budgets too low initially

### 4. Track Everything
- Record all income sources
- Don't forget small expenses
- Include cash transactions

### 5. Review Analytics Monthly
- Check which categories consume most money
- Identify trends and patterns
- Adjust budgets based on insights

## Navigation

### Desktop (Large Screens)
- Fixed sidebar on the left with all menu items
- Click any menu item to navigate
- Active page is highlighted in blue

### Mobile (Small Screens)
- Bottom navigation bar with icons
- Tap any icon to navigate
- Current page is highlighted

## System Categories

### Income Categories
- 💰 Salary
- 💼 Freelance
- 📈 Investment
- 🎁 Gift
- 💵 Other Income

### Expense Categories
- 🍔 Food
- 🚗 Transportation
- 🛍️ Shopping
- 🏥 Healthcare
- 🎬 Entertainment
- 💡 Bills
- 📚 Education
- ✈️ Travel
- 💸 Other Expense

## Troubleshooting

### Can't see my transactions
- Check if filters are applied
- Try clearing search and category filters
- Ensure you're looking at the correct date range

### Budget not updating
- Budgets update automatically when transactions are added
- Refresh the page if needed
- Ensure transactions are in the same month as the budget

### Goal not marking as complete
- Click "Update Progress" and enter the exact target amount or more
- The system automatically detects completion

### Forgot Password
1. Click "Forgot Password?" on login page
2. Enter your email
3. Check your email for reset link
4. Follow the link to set a new password

## Data Security

- All data is securely stored in Supabase
- Passwords are encrypted
- Each user can only see their own data
- Row Level Security (RLS) ensures data isolation

## Support

For issues or questions:
- Check this user guide first
- Review the TODO.md file for known limitations
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Currency

All amounts in the application are displayed in Indian Rupee (₹).
