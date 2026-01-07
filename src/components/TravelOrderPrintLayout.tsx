import { format } from 'date-fns';
import dostLogo from '@/assets/logo.png';
import isoLogo from '@/assets/iso-certification.jpg';

interface TravelOrder {
  travel_order_no: string;
  order_date: string;
  inclusive_dates_start: string | null;
  inclusive_dates_end: string | null;
  destinations: string | null;
  purpose: string | null;
  expense_type: string | null;
  expense_type_other: string | null;
  transportation_type: string | null;
  has_actual_expenses: boolean;
  has_per_diem: boolean;
  remarks: string | null;
  approved_by: string | null;
  approved_by_position: string | null;
}

interface Personnel {
  name: string;
  position: string | null;
  division_agency: string | null;
}

interface Props {
  order: TravelOrder;
  personnel: Personnel[];
}

export default function TravelOrderPrintLayout({ order, personnel }: Props) {
  return (
    <div className="p-4 font-serif text-sm leading-tight">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <img src={dostLogo} alt="DOST Logo" className="h-16" />
        <div className="text-center flex-1">
          <p className="text-xs">Republic of the Philippines</p>
          <p className="font-bold">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
          <p className="text-xs">CORDILLERA ADMINISTRATIVE REGION</p>
          <p className="text-xs">Baguio City</p>
        </div>
        <img src={isoLogo} alt="ISO Certification" className="h-16" />
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-lg underline">TRAVEL ORDER</h1>
        <p className="text-sm">No. {order.travel_order_no}</p>
      </div>

      {/* Personnel Table */}
      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-1 text-left">Name</th>
            <th className="border border-black px-2 py-1 text-left">Position</th>
            <th className="border border-black px-2 py-1 text-left">Division/Agency</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((person, index) => (
            <tr key={index}>
              <td className="border border-black px-2 py-1">{person.name}</td>
              <td className="border border-black px-2 py-1">{person.position || ''}</td>
              <td className="border border-black px-2 py-1">{person.division_agency || ''}</td>
            </tr>
          ))}
          {personnel.length === 0 && (
            <tr>
              <td className="border border-black px-2 py-1" colSpan={3}>
                No personnel assigned
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Travel Details */}
      <div className="mb-4 space-y-2">
        <p>
          <span className="font-bold">Inclusive Dates: </span>
          {order.inclusive_dates_start && order.inclusive_dates_end
            ? `${format(new Date(order.inclusive_dates_start), 'MMMM dd')} - ${format(new Date(order.inclusive_dates_end), 'MMMM dd, yyyy')}`
            : '_________________'}
        </p>
        <p>
          <span className="font-bold">Destination(s): </span>
          {order.destinations || '_________________'}
        </p>
        <p>
          <span className="font-bold">Purpose: </span>
          {order.purpose || '_________________'}
        </p>
      </div>

      {/* Travel Expenses Section */}
      <div className="mb-4 border border-black p-3">
        <p className="font-bold mb-2">TRAVEL EXPENSES SHALL BE CHARGED TO:</p>
        <div className="flex gap-8 mb-2">
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.expense_type === 'general_fund' ? '✓' : ''}
            </span>
            General Fund
          </label>
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.expense_type === 'project_funds' ? '✓' : ''}
            </span>
            Project Funds
          </label>
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.expense_type === 'others' ? '✓' : ''}
            </span>
            Others: {order.expense_type === 'others' ? order.expense_type_other : '________'}
          </label>
        </div>

        <p className="font-bold mb-2">METHODS:</p>
        <div className="flex gap-8 mb-2">
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.has_actual_expenses ? '✓' : ''}
            </span>
            Actual Expenses
          </label>
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.has_per_diem ? '✓' : ''}
            </span>
            Per Diem
          </label>
        </div>

        <p className="font-bold mb-2">MODE OF TRANSPORTATION:</p>
        <div className="flex gap-8">
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.transportation_type === 'official_vehicle' ? '✓' : ''}
            </span>
            Use of Official Vehicle
          </label>
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border border-black text-center leading-4">
              {order.transportation_type === 'public_conveyance' ? '✓' : ''}
            </span>
            Public Conveyance
          </label>
        </div>
      </div>

      {/* Remarks */}
      {order.remarks && (
        <div className="mb-4">
          <p className="font-bold">Special Instructions/Remarks:</p>
          <p>{order.remarks}</p>
        </div>
      )}

      {/* Approval Section */}
      <div className="mt-8 flex justify-end">
        <div className="text-center">
          <p className="font-bold border-b border-black min-w-[200px]">
            {order.approved_by || ''}
          </p>
          <p className="text-xs">{order.approved_by_position || 'Regional Director'}</p>
        </div>
      </div>

      {/* Date */}
      <div className="mt-4">
        <p>
          Date: {format(new Date(order.order_date), 'MMMM dd, yyyy')}
        </p>
      </div>
    </div>
  );
}
