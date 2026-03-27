'use client';
import Table from '@/components/shared/table/Table';
import { TableColumn } from '@/components/shared/table/TableHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsdtIcon } from '@/../public/svg';
import { RoutePaths } from '@/routes/routesPath';

interface Invoice {
  id: string;
  invoiceNo: string;
  title: string;
  amount: number;
  paidIn: string;
  status: 'Pending' | 'Overdue' | 'Paid';
  issueDate: string;
  name?: string;
  number?: string;
  company?: string;
  [key: string]: string | number | undefined;
}

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNo: '20',
    title: '[CUR]10/hr',
    amount: 1200,
    paidIn: 'NGN',
    status: 'Pending',
    issueDate: '25th Oct 2025',
    name: 'Lagos Payroll Invoice',
    number: '20',
    company: 'Vestroll Nigeria',
  },
  {
    id: '2',
    invoiceNo: '14',
    title: '[CUR]10/hr',
    amount: 2400,
    paidIn: 'USD',
    status: 'Overdue',
    issueDate: '25th Oct 2025',
    name: 'North America Payroll Invoice',
    number: '14',
    company: 'Vestroll Inc.',
  },
  {
    id: '3',
    invoiceNo: '12',
    title: '[CUR]10/hr',
    amount: 950,
    paidIn: 'USDT',
    status: 'Paid',
    issueDate: '25th Oct 2025',
    name: 'Treasury Settlement Invoice',
    number: '12',
    company: 'Vestroll Treasury',
  },
];

const currencySymbolMap: Record<string, string> = {
  NGN: '₦',
  USD: '$',
};

function getCurrencyPrefix(currency: string): string {
  return currencySymbolMap[currency] ?? currencySymbolMap.USD;
}

function formatAmount(amount: number, currency: string): string {
  return `${getCurrencyPrefix(currency)}${amount.toLocaleString()}.00`;
}

function formatRate(title: string, currency: string): string {
  if (title.includes('[CUR]')) {
    return title.replace('[CUR]', getCurrencyPrefix(currency));
  }

  if (!title.startsWith('$')) {
    return title;
  }

  return `${getCurrencyPrefix(currency)}${title.slice(1)}`;
}

function shouldShowCryptoIcon(currency: string): boolean {
  return currency === 'USDT';
}

const PayoutHistory = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const router = useRouter();

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.name?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.number?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.company?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.title?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNo?.toLowerCase().includes(search.toLowerCase()),
  );

  const invoiceColumns: TableColumn[] = [
    { key: 'invoiceNo', header: 'Worked hours' },
    { key: 'title', header: 'Rate' },
    { key: 'amount', header: 'Calculated amount', align: 'center' },
    { key: 'paidIn', header: 'Paid in', align: 'center' },
    { key: 'status', header: 'Status', align: 'center' },
    { key: 'issueDate', header: 'Date', align: 'right' },
  ];

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Pending':
        return ` border-[#E79A23] bg-[#FEF7EB] text-[#E79A23]`;
      case 'Overdue':
        return `border-[#C64242] bg-[#FEECEC] text-[#C64242]`;
      case 'Paid':
        return `border-[#26902B] bg-[#EDFEEC] text-[#26902B]`;
      default:
        return;
    }
  };

  const renderInvoiceCell = (item: Invoice, column: TableColumn) => {
    switch (column.key) {
      case 'title':
        return (
          <div className="font-semibold text-text-header">
            {formatRate(item.title, item.paidIn)}
          </div>
        );
      case 'amount':
        return (
          <div className="font-semibold text-text-header">
            {formatAmount(item.amount, item.paidIn)}
          </div>
        );
      case 'paidIn':
        return (
          <div className="flex items-center font-medium gap-1 py-1.5 px-3 border border-border-primary bg-fill-background rounded-full w-fit mx-auto">
            {shouldShowCryptoIcon(item.paidIn) ? <UsdtIcon /> : null}
            <span className="text-text-header">{item.paidIn}</span>
          </div>
        );
      case 'status':
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(
              item.status,
            )}`}
          >
            {item.status}
          </span>
        );
      case 'invoiceNo':
        return <p className="font-medium text-gray-900">{item.invoiceNo}</p>;
      case 'title':
        return <span className="text-gray-600">{item.title}</span>;
      case 'issueDate':
        return <span className="text-gray-600">{item.issueDate}</span>;
      default:
        return (
          (item as Record<string, string | number | undefined>)[column.key] ||
          '-'
        );
    }
  };

  const renderMobileCell = (item: Invoice) => (
    <div className="flex justify-between w-full gap-4">
      <div className="flex-1 min-w-0 space-y-2">
        <p className="font-semibold text-gray-500 truncate">
          {item.invoiceNo} @ {formatRate(item.title, item.paidIn)}
        </p>
        <span className="flex items-center gap-2 ">
          <p className="text-xs font-medium text-gray-300">
            {formatAmount(item.amount, item.paidIn)}
          </p>

          <div className="self-stretch w-px bg-gray-150" />

          <div className="flex items-center gap-1 font-medium ">
            {shouldShowCryptoIcon(item.paidIn) ? <UsdtIcon /> : null}

            <span className="text-sm font-medium text-gray-600">
              {item.paidIn}
            </span>
          </div>
        </span>
      </div>

      <div className="flex flex-col items-end justify-between space-y-2 shrink-0">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
            item.status,
          )}`}
        >
          {item.status}
        </span>
        <p className="text-xs font-medium text-gray-400">25th Oct 2025</p>
      </div>
    </div>
  );

  // Handle item selection
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(
      checked ? filteredInvoices.map((invoice) => invoice.id) : [],
    );
  };

  const handleRowClick = (invoice: Invoice) => {
    router.push(`${RoutePaths.INVOICES}/${invoice.invoiceNo.replace('#', '')}`);
  };

  const showModal = () => {
    console.log('Show filter modal');
  };

  return (
    <div className="w-full p-4 space-y-2 bg-white rounded-sm shadow">
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border text-[#5A42DE] border-[#5A42DE] bg-[#E8E5FA] `}
      >
        Payout History
      </span>

      <Table
        showFilterHeader={false}
        showCheckbox={false}
        data={filteredInvoices}
        columns={invoiceColumns}
        search={search}
        setSearch={setSearch}
        showModal={showModal}
        selectedTab="Invoice history"
        searchPlaceholder="Search by title..."
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onRowClick={handleRowClick}
        renderCell={renderInvoiceCell}
        emptyTitle={search ? 'No invoices found' : 'No invoices yet'}
        emptyDescription={
          search
            ? `No invoices match "${search}". Try adjusting your search.`
            : 'Invoices sent to you will be displayed here'
        }
        renderMobileCell={renderMobileCell}
      />
    </div>
  );
};

export default PayoutHistory;
