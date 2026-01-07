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
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMMM d')}-${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  return (
    <div className="print-layout bg-white text-black p-8 text-[11px] leading-tight max-w-[8.5in] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <img src={dostLogo} alt="DOST Logo" className="w-16 h-16 object-contain" />
        <div className="text-center flex-1 px-4">
          <p className="text-[10px] italic">Republic of the Philippines</p>
          <p className="font-bold text-[13px]">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
          <p className="text-[11px] italic text-blue-700">Cordillera Administrative Region</p>
          <p className="text-[10px]">Km.6, La Trinidad, Benguet</p>
        </div>
        <div className="flex items-start gap-1">
          <img src={isoLogo} alt="ISO Certification" className="w-12 h-12 object-contain" />
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
        <p className="text-[11px]">{format(new Date(order.order_date), 'MMMM d, yyyy')}</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <p className="font-bold text-[11px]">LOCAL TRAVEL ORDER No. {order.travel_order_no}</p>
      </div>

      {/* Authority Statement */}
      <p className="text-[11px] mb-2">Authority to Travel is hereby granted to:</p>

      {/* Personnel Table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <td className="border-b border-black px-1 py-1 text-[10px] w-[30%]">NAME</td>
            <td className="border-b border-black px-1 py-1 text-[10px] w-[15%]">POSITION</td>
            <td className="border-b border-black px-1 py-1 text-[10px] w-[25%]">DIVISION/AGENCY</td>
            <td className="border-b border-black px-1 py-1 text-[10px] w-[30%]">Inclusive Date/s of Travel:</td>
          </tr>
        </thead>
        <tbody>
          {personnel.map((person, index) => (
            <tr key={index}>
              <td className="px-1 py-1 text-[10px]">{person.name}</td>
              <td className="px-1 py-1 text-[10px]">{person.position || ''}</td>
              <td className="px-1 py-1 text-[10px]">{person.division_agency || ''}</td>
              {index === 0 && (
                <td className="px-1 py-1 text-[10px]" rowSpan={personnel.length || 1}>
                  {formatInclusiveDates()}
                </td>
              )}
            </tr>
          ))}
          {personnel.length === 0 && (
            <tr>
              <td className="px-1 py-1 text-[10px]">&nbsp;</td>
              <td className="px-1 py-1 text-[10px]"></td>
              <td className="px-1 py-1 text-[10px]"></td>
              <td className="px-1 py-1 text-[10px]">{formatInclusiveDates()}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Destination, Inclusive Dates, Purpose Row */}
      <table className="w-full border-collapse mb-1">
        <thead>
          <tr>
            <td className="border-b border-black px-1 py-1 text-[10px] font-bold w-[35%]">Destination/s:</td>
            <td className="border-b border-black px-1 py-1 text-[10px] font-bold w-[30%]">Inclusive Date/s of Travel:</td>
            <td className="border-b border-black px-1 py-1 text-[10px] font-bold w-[35%]">Purpose of Travel:</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-1 py-2 text-[10px] align-top">{order.destinations || ''}</td>
            <td className="px-1 py-2 text-[10px] align-top"></td>
            <td className="px-1 py-2 text-[10px] align-top">*{order.purpose || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Travel Expenses Section */}
      <table className="w-full border-collapse mb-0">
        <tbody>
          <tr>
            <td className="border-t border-black px-1 py-1 text-[10px] font-bold w-[25%] align-top">
              Travel Expenses to<br />be Incurred:
            </td>
            <td className="border-t border-black px-1 py-1 text-[10px] align-top" colSpan={3}>
              <span className="font-bold">Appropriation/Fund to which travel expenses would be charged to:</span>
              <div className="flex gap-6 mt-1">
                <span>
                  ({order.expense_type === 'general_fund' ? 'X' : ' '}) General Fund
                </span>
                <span>
                  ({order.expense_type === 'project_funds' ? 'X' : ' '}) Project Funds
                </span>
                <span>
                  ({order.expense_type === 'others' ? 'X' : ' '}) Others: (e.g. sponsor/<br />
                  <span className="ml-12">requesting agency)</span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Actual/Per Diem Section */}
      <table className="w-full border-collapse mb-0">
        <tbody>
          <tr>
            <td className="px-1 py-1 text-[10px] w-[25%] align-top">
              <p className="mb-1">( ) <span className="font-bold">Actual</span></p>
              <p className="ml-4">Food</p>
              <p className="ml-4">Transportation</p>
              <p className="ml-4">Accommodation</p>
            </td>
            <td className="px-1 py-1 text-[10px] w-[25%] align-top">
              <p className="mb-1">( ) <span className="font-bold">Per Diem</span></p>
              <p className="ml-4">Accommodation</p>
              <p className="ml-4">Meals/Food</p>
              <p className="ml-4">Incidental expenses</p>
            </td>
            <td className="px-1 py-1 text-[10px] w-[50%] align-top" colSpan={2}></td>
          </tr>
          <tr>
            <td className="px-1 py-1 text-[10px] align-top" colSpan={2}>
              <p>({order.transportation_type ? 'X' : ' '}) <span className="font-bold">Transportation</span></p>
              <p className="ml-4">
                Official Vehicle
                <span className="ml-4">{order.transportation_type === 'official_vehicle' ? 'X' : ''}</span>
              </p>
              <p className="ml-4">Public Conveyance</p>
              <p className="ml-4">(Airplane, Bus, Taxi)</p>
            </td>
            <td className="px-1 py-1 text-[10px] align-top" colSpan={2}></td>
          </tr>
          <tr>
            <td className="px-1 py-1 text-[10px] align-top" colSpan={4}>
              <p>( ) <span className="font-bold">Others</span></p>
              <p>Remarks/ Special Instructions</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks Text */}
      <div className="border-t border-black pt-2 mb-4">
        <p className="text-[9px] italic leading-snug">
          {order.remarks || 'A report of your travel must be submitted to the Agency Head/ Supervising official within 7 days from completion of travel. Liquidation of cash advance should be in accordance with Executive Order No. 298: Rules and Regulations and New Rates of Allowances for Official Local and foreign Travels of Government Personnel.'}
        </p>
      </div>

      {/* Approval Section */}
      <div className="mt-6">
        <p className="text-[10px] mb-6">Approved by:</p>
        <div className="w-56">
          <div className="border-b border-black mb-1 h-6"></div>
          <p className="font-bold text-[10px]">{order.approved_by?.toUpperCase() || ''}</p>
          <p className="text-[9px]">{order.approved_by_position || ''}</p>
        </div>
      </div>
    </div>
  );
}
