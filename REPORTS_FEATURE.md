# Reports & Export Feature Documentation

## Overview
The Reports feature allows users to generate comprehensive financial reports in PDF and Excel formats. Users can select custom date ranges and download detailed reports with transaction data, summaries, and category breakdowns.

## Features

### 1. Report Types
- **Monthly Summary**: Complete overview of income and expenses for a specific month
- **Category Breakdown**: Detailed analysis of spending by category
- **Cash Flow Analysis**: Income vs expenses trends
- **Custom Report**: User-defined date range reports

### 2. Export Formats

#### PDF Reports
Professional PDF documents with:
- **Header Section**:
  - Report title
  - Report type
  - Date range
  - Generation timestamp

- **Financial Summary**:
  - Total Income
  - Total Expenses
  - Net Balance

- **Transactions Table**:
  - Date
  - Description
  - Category
  - Income/Expense amounts
  - Payment method

- **Category Breakdown**:
  - Category name
  - Total amount
  - Percentage of total expenses

#### Excel Reports
Multi-sheet Excel workbooks with:
- **Summary Sheet**:
  - Report metadata
  - Financial summary
  - Key metrics

- **Transactions Sheet**:
  - Complete transaction list
  - All transaction details
  - Sortable and filterable data

- **Category Breakdown Sheet**:
  - Category-wise analysis
  - Amount and percentage data
  - Ready for charts and pivot tables

### 3. Date Range Selection

#### Quick Date Ranges
One-click buttons for common periods:
- **This Month**: Current month (1st to last day)
- **Last Month**: Previous month
- **This Year**: Current year (Jan 1 to Dec 31)
- **Last Year**: Previous year

#### Custom Date Range
Manual date selection:
- Start date picker
- End date picker
- Flexible range selection

## User Interface

### Reports Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Reports & Export                                            │
│ Generate and download financial reports                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────┐
│ Report Configuration             │  │ Report Features      │
│                                  │  │                      │
│ Report Type: [Monthly Summary ▼] │  │ PDF Report Includes: │
│                                  │  │ • Financial summary  │
│ Quick Date Ranges:               │  │ • Transaction list   │
│ [This Month] [Last Month]        │  │ • Category breakdown │
│ [This Year]  [Last Year]         │  │ • Income vs expenses │
│                                  │  │                      │
│ Custom Date Range:               │  │ Excel Report:        │
│ Start Date: [2024-01-01]         │  │ • Multiple sheets    │
│ End Date:   [2024-12-31]         │  │ • Summary sheet      │
│                                  │  │ • Transactions sheet │
│ [Download PDF] [Download Excel]  │  │ • Category analysis  │
└──────────────────────────────────┘  └──────────────────────┘
```

### Dashboard Integration

The Dashboard now includes a "Generate Report" button in the header for quick access:

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                        [Generate Report] Button   │
│ Welcome back! Here's your financial overview...             │
└─────────────────────────────────────────────────────────────┘
```

## Navigation

### Sidebar (Desktop)
New "Reports" menu item added:
- Icon: FileText (document icon)
- Position: Between "Fixed Deposits" and "Profile"
- Always visible to authenticated users

### Mobile Navigation
New "Reports" tab added:
- Icon: FileText
- Position: Between "FD" and "Profile"
- Accessible from bottom navigation bar

## Technical Implementation

### Dependencies
```json
{
  "jspdf": "^2.x.x",
  "jspdf-autotable": "^3.x.x",
  "xlsx": "^0.18.x"
}
```

### File Structure
```
src/
├── pages/
│   └── Reports.tsx          # Main reports page
├── routes.tsx               # Added /reports route
└── components/
    └── layout/
        ├── Sidebar.tsx      # Added Reports nav item
        └── MobileNav.tsx    # Added Reports nav item
```

### API Integration
Uses existing `transactionApi.getTransactions()` with date filters:
```typescript
const transactions = await transactionApi.getTransactions(user.id, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

## Usage Examples

### Example 1: Generate Monthly Report

1. Navigate to Reports page
2. Select "Monthly Summary" as report type
3. Click "This Month" quick button
4. Click "Download PDF"
5. PDF file downloads: `expense-report-2024-12-01-to-2024-12-31.pdf`

### Example 2: Generate Custom Date Range Excel

1. Navigate to Reports page
2. Select "Custom Report" as report type
3. Set Start Date: 2024-01-01
4. Set End Date: 2024-06-30
5. Click "Download Excel"
6. Excel file downloads: `expense-report-2024-01-01-to-2024-06-30.xlsx`

### Example 3: Quick Report from Dashboard

1. On Dashboard, click "Generate Report" button
2. Redirected to Reports page
3. Select date range and generate report

## Report Content Examples

### PDF Report Sample

```
═══════════════════════════════════════════════════════════
                    Expense Tracker Report
═══════════════════════════════════════════════════════════

Report Type: MONTHLY
Period: 2024-12-01 to 2024-12-31
Generated: 2024-12-06 10:30:45

───────────────────────────────────────────────────────────
Financial Summary
───────────────────────────────────────────────────────────
Total Income:     ₹18,000.00
Total Expenses:   ₹16,000.00
Net Balance:      ₹2,000.00

───────────────────────────────────────────────────────────
Transactions
───────────────────────────────────────────────────────────
Date       | Description  | Category | Income    | Expense   | Payment
-----------|--------------|----------|-----------|-----------|--------
2024-12-01 | Groceries    | Food     | -         | ₹2,000.00 | Cash
2024-12-05 | Salary       | Income   | ₹18,000.00| -         | Bank
2024-12-10 | Transport    | Travel   | -         | ₹1,500.00 | Card
...

───────────────────────────────────────────────────────────
Expense Breakdown by Category
───────────────────────────────────────────────────────────
Category      | Amount      | Percentage
--------------|-------------|------------
Food          | ₹2,000.00   | 12.5%
Travel        | ₹1,500.00   | 9.4%
Shopping      | ₹5,000.00   | 31.3%
...
```

### Excel Report Structure

**Sheet 1: Summary**
```
A                    | B
---------------------|------------------
Expense Tracker Report
                     |
Report Type:         | MONTHLY
Period:              | 2024-12-01 to 2024-12-31
Generated:           | 2024-12-06 10:30:45
                     |
Financial Summary    |
Total Income:        | 18000
Total Expenses:      | 16000
Net Balance:         | 2000
```

**Sheet 2: Transactions**
```
Date       | Description | Category | Type    | Amount | Payment
-----------|-------------|----------|---------|--------|--------
2024-12-01 | Groceries   | Food     | expense | 2000   | Cash
2024-12-05 | Salary      | Income   | income  | 18000  | Bank
...
```

**Sheet 3: Category Breakdown**
```
Category | Amount | Percentage
---------|--------|------------
Food     | 2000   | 12.5%
Travel   | 1500   | 9.4%
Shopping | 5000   | 31.3%
...
```

## Features & Benefits

### For Users
✅ **Easy Export**: One-click report generation  
✅ **Multiple Formats**: PDF for viewing, Excel for analysis  
✅ **Flexible Dates**: Quick ranges or custom selection  
✅ **Comprehensive Data**: All transaction details included  
✅ **Professional Format**: Clean, organized reports  
✅ **Offline Access**: Download and view anytime  

### For Analysis
✅ **Category Insights**: See spending patterns  
✅ **Time Periods**: Compare different months/years  
✅ **Excel Editing**: Further customize in Excel  
✅ **Charts Ready**: Excel data ready for charts  
✅ **Sharing**: Easy to share with accountants/family  

## Error Handling

### Validation
- **Date Required**: Both start and end dates must be selected
- **Date Range**: End date must be after start date
- **No Data**: Graceful handling when no transactions exist

### User Feedback
- **Success Toast**: "PDF report generated successfully!"
- **Error Toast**: "Failed to generate PDF report"
- **Loading State**: Button disabled during generation

## Future Enhancements (Optional)

1. **Email Reports**: Send reports directly via email
2. **Scheduled Reports**: Automatic monthly report generation
3. **Report Templates**: Customizable report layouts
4. **Charts in PDF**: Include visual charts in PDF reports
5. **Multi-Currency**: Support for multiple currencies
6. **Tax Reports**: Specialized tax-ready reports
7. **Comparison Reports**: Year-over-year comparisons
8. **Budget Reports**: Budget vs actual spending

## Testing

All TypeScript and ESLint checks pass:
```bash
npm run lint
# ✅ Checked 102 files in 1458ms. No fixes applied.
```

## Files Modified/Created

### Created
1. `/src/pages/Reports.tsx` - Main reports page component

### Modified
1. `/src/routes.tsx` - Added Reports route
2. `/src/components/layout/Sidebar.tsx` - Added Reports nav item
3. `/src/components/layout/MobileNav.tsx` - Added Reports nav item
4. `/src/pages/Dashboard.tsx` - Added "Generate Report" button

### Dependencies Added
1. `jspdf` - PDF generation library
2. `jspdf-autotable` - Table plugin for jsPDF
3. `xlsx` - Excel file generation library

## Conclusion

The Reports & Export feature provides users with powerful tools to analyze their financial data. With support for both PDF and Excel formats, flexible date ranges, and comprehensive data inclusion, users can generate professional reports for personal analysis, tax preparation, or sharing with financial advisors.

**Your financial data is now exportable and analyzable!** 📊📄
