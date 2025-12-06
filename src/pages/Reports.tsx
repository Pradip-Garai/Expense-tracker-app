import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, FileSpreadsheet, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type ReportType = 'monthly' | 'category' | 'cashflow' | 'custom';

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  const generatePDFReport = async () => {
    if (!user) return;

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setGenerating(true);
    try {
      // Fetch transactions
      const transactions = await transactionApi.getTransactions(user.id, {
        startDate,
        endDate,
      });

      // Calculate summary
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const balance = income - expenses;

      // Create PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('Expense Tracker Report', 14, 20);

      // Report Info
      doc.setFontSize(10);
      doc.text(`Report Type: ${reportType.toUpperCase()}`, 14, 30);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 36);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

      // Summary Section
      doc.setFontSize(14);
      doc.text('Financial Summary', 14, 55);
      doc.setFontSize(10);
      doc.text(`Total Income: ${formatCurrency(income)}`, 14, 63);
      doc.text(`Total Expenses: ${formatCurrency(expenses)}`, 14, 69);
      doc.text(`Net Balance: ${formatCurrency(balance)}`, 14, 75);

      // Transactions Table
      const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description || '-',
        t.category?.name || '-',
        t.type === 'income' ? formatCurrency(Number(t.amount)) : '-',
        t.type === 'expense' ? formatCurrency(Number(t.amount)) : '-',
        t.payment_method || '-',
      ]);

      autoTable(doc, {
        startY: 85,
        head: [['Date', 'Description', 'Category', 'Income', 'Expense', 'Payment']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [25, 118, 210] },
        styles: { fontSize: 8 },
      });

      // Category Breakdown
      const categoryBreakdown = new Map<string, number>();
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const category = t.category?.name || 'Uncategorized';
          categoryBreakdown.set(category, (categoryBreakdown.get(category) || 0) + Number(t.amount));
        });

      if (categoryBreakdown.size > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 85;
        doc.setFontSize(14);
        doc.text('Expense Breakdown by Category', 14, finalY + 15);

        const categoryData = Array.from(categoryBreakdown.entries()).map(([cat, amt]) => [
          cat,
          formatCurrency(amt),
          `${((amt / expenses) * 100).toFixed(1)}%`,
        ]);

        autoTable(doc, {
          startY: finalY + 22,
          head: [['Category', 'Amount', 'Percentage']],
          body: categoryData,
          theme: 'striped',
          headStyles: { fillColor: [76, 175, 80] },
          styles: { fontSize: 9 },
        });
      }

      // Save PDF
      doc.save(`expense-report-${startDate}-to-${endDate}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  const generateExcelReport = async () => {
    if (!user) return;

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setGenerating(true);
    try {
      // Fetch transactions
      const transactions = await transactionApi.getTransactions(user.id, {
        startDate,
        endDate,
      });

      // Calculate summary
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const balance = income - expenses;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['Expense Tracker Report'],
        [''],
        ['Report Type:', reportType.toUpperCase()],
        ['Period:', `${startDate} to ${endDate}`],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Financial Summary'],
        ['Total Income:', income],
        ['Total Expenses:', expenses],
        ['Net Balance:', balance],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Transactions Sheet
      const transactionsData = [
        ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method'],
        ...transactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.description || '-',
          t.category?.name || '-',
          t.type,
          Number(t.amount),
          t.payment_method || '-',
        ]),
      ];
      const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, transactionsSheet, 'Transactions');

      // Category Breakdown Sheet
      const categoryBreakdown = new Map<string, number>();
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const category = t.category?.name || 'Uncategorized';
          categoryBreakdown.set(category, (categoryBreakdown.get(category) || 0) + Number(t.amount));
        });

      if (categoryBreakdown.size > 0) {
        const categoryData = [
          ['Category', 'Amount', 'Percentage'],
          ...Array.from(categoryBreakdown.entries()).map(([cat, amt]) => [
            cat,
            amt,
            `${((amt / expenses) * 100).toFixed(1)}%`,
          ]),
        ];
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Breakdown');
      }

      // Save Excel file
      XLSX.writeFile(wb, `expense-report-${startDate}-to-${endDate}.xlsx`);
      toast.success('Excel report generated successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel report');
    } finally {
      setGenerating(false);
    }
  };

  const setQuickDateRange = (range: 'this-month' | 'last-month' | 'this-year' | 'last-year') => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (range) {
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last-year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Export</h1>
          <p className="text-muted-foreground mt-1">Generate and download financial reports</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configuration Card */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="category">Category Breakdown</SelectItem>
                    <SelectItem value="cashflow">Cash Flow Analysis</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Date Ranges */}
              <div className="space-y-2">
                <Label>Quick Date Ranges</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange('this-month')}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange('last-month')}
                  >
                    Last Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange('this-year')}
                  >
                    This Year
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange('last-year')}
                  >
                    Last Year
                  </Button>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={generatePDFReport}
                  disabled={generating || !startDate || !endDate}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={generateExcelReport}
                  disabled={generating || !startDate || !endDate}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Report Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">PDF Report Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Financial summary</li>
                  <li>• Detailed transaction list</li>
                  <li>• Category breakdown</li>
                  <li>• Income vs expenses</li>
                  <li>• Professional formatting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Excel Report Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multiple worksheets</li>
                  <li>• Summary sheet</li>
                  <li>• Transactions sheet</li>
                  <li>• Category analysis</li>
                  <li>• Editable data</li>
                </ul>
              </div>
              <div className="bg-primary/5 p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Use Excel reports for further analysis and custom charts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
