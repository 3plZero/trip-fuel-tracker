import { format } from 'date-fns';
import dostLogo from '@/assets/dost-car-logo.jpg';
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
  const formatInclusiveDates = () => {
    if (!order.inclusive_dates_start || !order.inclusive_dates_end) return '';
    const start = new Date(order.inclusive_dates_start);
    const end = new Date(order.inclusive_dates_end);
    
    if (start.getTime() === end.getTime()) {
      return format(start, 'MMMM d, yyyy');
    }
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMMM d')} & ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  // Ensure at least 5 rows for personnel
  const personnelRows = [...personnel];
  while (personnelRows.length < 5) {
    personnelRows.push({ name: '', position: null, division_agency: null });
  }

  return (
    <div className="print-layout bg-white text-black p-6 text-[10px] leading-tight max-w-[8.5in] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <img src={dostLogo} alt="DOST Logo" className="w-14 h-14 object-contain" />
        <div className="text-center flex-1 px-4">
          <p className="text-[10px] italic">Republic of the Philippines</p>
          <p className="font-bold text-[12px]">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
          <p className="text-[10px] italic text-blue-700">Cordillera Administrative Region</p>
          <p className="text-[9px]">Km.6, La Trinidad, Benguet</p>
        </div>
        <div className="flex items-start gap-1">
          <img src={isoLogo} alt="ISO Certification" className="w-10 h-10 object-contain" />
          <div className="text-right text-[7px] leading-tight">
            <p className="font-bold">CERTIFICATION</p>
            <p className="font-bold">INTERNATIONAL</p>
            <p className="font-bold">ISO 9001:2015</p>
            <p className="text-[6px]">Cert. No. CIP/4213/09/01/615</p>
          </div>
        </div>
      </div>

      {/* Date - right aligned */}
      <div className="text-right mb-4">
        <p className="text-[10px]">{format(new Date(order.order_date), 'MMMM d, yyyy')}</p>
      </div>

      {/* Title */}
      <div className="mb-3">
        <p className="font-bold text-[11px]">LOCAL TRAVEL ORDER No. {order.travel_order_no}</p>
      </div>

      {/* Authority Statement */}
      <p className="text-[10px] mb-2">Authority to Travel is hereby granted to:</p>

      {/* Personnel Table */}
      <table className="w-full border-collapse mb-1">
        <thead>
          <tr>
            <td className="border-b border-black px-1 py-1 text-[9px] font-bold w-[35%]">NAME</td>
            <td className="border-b border-black px-1 py-1 text-[9px] font-bold w-[15%]">POSITION</td>
            <td className="border-b border-black px-1 py-1 text-[9px] font-bold w-[25%]">DIVISION/AGENCY</td>
            <td className="border-b border-black px-1 py-1 text-[9px] font-bold w-[25%]">Inclusive Date/s of Travel:</td>
          </tr>
        </thead>
        <tbody>
          {personnelRows.map((person, index) => (
            <tr key={index}>
              <td className="px-1 py-0.5 text-[9px] h-[16px]">{person.name}</td>
              <td className="px-1 py-0.5 text-[9px]">{person.position || ''}</td>
              <td className="px-1 py-0.5 text-[9px]">{person.division_agency || ''}</td>
              {index === 0 && (
                <td className="px-1 py-0.5 text-[9px]" rowSpan={personnelRows.length}>
                  {formatInclusiveDates()}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Destination and Purpose - Combined Row */}
      <table className="w-full border-collapse mb-1">
        <tbody>
          <tr>
            <td className="border-t border-black px-1 py-2 text-[9px] align-top w-[35%]">
              {order.destinations || ''}
            </td>
            <td className="border-t border-black px-1 py-2 text-[9px] align-top" colSpan={3}>
              {order.purpose || ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Travel Expenses Header */}
      <table className="w-full border-collapse mb-0">
        <tbody>
          <tr>
            <td className="border-t border-black px-1 py-1 text-[9px] w-[20%] align-top">
              <p className="font-bold">Travel Expenses to</p>
              <p className="font-bold">be Incurred:</p>
            </td>
            <td className="border-t border-black px-1 py-1 text-[9px] align-top" colSpan={4}>
              <p className="font-bold">Appropriation/Fund to which travel expenses would be charged to:</p>
              <div className="flex gap-4 mt-1">
                <span>({order.expense_type === 'general_fund' ? 'X' : ' '}) General Fund</span>
                <span>({order.expense_type === 'project_funds' ? 'X' : ' '}) Project Funds</span>
                <span>({order.expense_type === 'others' ? 'X' : ' '}) Others: (e.g. sponsor/</span>
              </div>
              <div className="ml-64 -mt-0.5">
                <span className="text-[8px]">requesting agency)</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Actual/Per Diem/Transportation Section */}
      <table className="w-full border-collapse mb-0">
        <tbody>
          {/* Actual Section */}
          <tr>
            <td className="px-1 py-0.5 text-[9px] w-[20%]">({order.has_actual_expenses ? 'X' : ' '}) <span className="font-bold">Actual</span></td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={4}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Food</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Transportation</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Accommodation</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          {/* Per Diem Section */}
          <tr>
            <td className="px-1 py-0.5 text-[9px]">({order.has_per_diem ? 'X' : ' '}) <span className="font-bold">Per Diem</span></td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={4}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Accommodation</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Meals/Food</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Incidental expenses</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          {/* Transportation Section */}
          <tr>
            <td className="px-1 py-0.5 text-[9px]">({order.transportation_type ? 'X' : ' '}) <span className="font-bold">Transportation</span></td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={4}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Official Vehicle</td>
            <td className="px-1 py-0.5 text-[9px]">{order.transportation_type === 'official_vehicle' ? 'X' : ''}</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={2}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">Public Conveyance</td>
            <td className="px-1 py-0.5 text-[9px]">{order.transportation_type === 'public_conveyance' ? 'X' : ''}</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={2}></td>
          </tr>
          <tr>
            <td className="px-1 py-0.5 text-[9px]"></td>
            <td className="px-1 py-0.5 text-[9px]">(Airplane, Bus, Taxi)</td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={3}></td>
          </tr>
          {/* Others Section */}
          <tr>
            <td className="px-1 py-0.5 text-[9px]">( ) <span className="font-bold">Others</span></td>
            <td className="px-1 py-0.5 text-[9px]" colSpan={4}></td>
          </tr>
          {/* Remarks Header */}
          <tr>
            <td className="px-1 py-0.5 text-[9px]" colSpan={5}>
              <span className="font-bold">Remarks/ Special Instructions</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks Content */}
      <div className="border-t border-black pt-2 mb-3 mt-1">
        <p className="text-[9px] italic leading-snug">
          A report of your travel must be submitted to the Agency Head/ Supervising official within 7 days from completion of
          travel. Liquidation of cash advance should be in accordance with Executive Order No. 298: Rules and Regulations and
          New Rates of Allowances for Official Local and foreign Travels of Government Personnel.
        </p>
      </div>

      {/* Approval Section */}
      <div className="mt-4 ml-8">
        <p className="text-[10px] mb-6">Approved by:</p>
        <div className="w-48">
          <div className="border-b border-black mb-0.5 h-5"></div>
          <p className="font-bold text-[10px]">{order.approved_by || ''}</p>
          <p className="text-[9px]">{order.approved_by_position || ''}</p>
        </div>
      </div>
    </div>
  );
}
