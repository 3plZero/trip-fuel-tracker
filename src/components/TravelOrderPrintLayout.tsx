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
    <div className="print-layout bg-white text-black p-6 text-[10px] leading-tight max-w-[8.5in] mx-auto font-serif">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={isoLogo} alt="ISO Certification" className="w-10 h-10 object-contain" />
          <div className="text-left text-[7px] leading-tight">
            <p className="font-bold">CERTIFICATION</p>
            <p className="font-bold">INTERNATIONAL</p>
            <p className="font-bold">ISO 9001:2015</p>
            <p className="text-[6px]">Cert. No. CIP/4213/09/01/615</p>
          </div>
        </div>
        <div className="text-center flex-1 px-4">
          <p className="text-[9px] italic">Republic of the Philippines</p>
          <p className="font-bold text-[12px]">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
          <p className="text-[10px] italic text-blue-700">Cordillera Administrative Region</p>
          <p className="text-[9px]">Km.6, La Trinidad, Benguet</p>
        </div>
        <img src={dostLogo} alt="DOST Logo" className="w-14 h-14 object-contain" />
      </div>

      {/* Date */}
      <div className="text-right mb-2">
        <p className="text-[10px]">Date: {format(new Date(order.order_date), 'MMMM d, yyyy')}</p>
      </div>

      {/* Title */}
      <div className="text-center mb-3">
        <h1 className="font-bold text-[14px] underline">LOCAL TRAVEL ORDER No. {order.travel_order_no}</h1>
      </div>

      {/* Authority Statement */}
      <p className="text-[10px] mb-2">Authority to Travel is hereby granted to:</p>

      {/* Personnel Table */}
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left text-[9px] w-[35%]">NAME</th>
            <th className="border border-black px-2 py-1 text-left text-[9px] w-[20%]">POSITION</th>
            <th className="border border-black px-2 py-1 text-left text-[9px] w-[25%]">DIVISION/AGENCY</th>
            <th className="border border-black px-2 py-1 text-left text-[9px] w-[20%]">Inclusive Date/s of Travel:</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((person, index) => (
            <tr key={index} className="h-[18px]">
              <td className="border border-black px-2 py-1 text-[9px]">{person.name}</td>
              <td className="border border-black px-2 py-1 text-[9px]">{person.position || ''}</td>
              <td className="border border-black px-2 py-1 text-[9px]">{person.division_agency || ''}</td>
              {index === 0 && (
                <td className="border border-black px-2 py-1 text-[9px]" rowSpan={personnel.length || 1}>
                  {formatInclusiveDates()}
                </td>
              )}
            </tr>
          ))}
          {personnel.length === 0 && (
            <tr className="h-[18px]">
              <td className="border border-black px-2 py-1 text-[9px]" colSpan={3}>&nbsp;</td>
              <td className="border border-black px-2 py-1 text-[9px]">{formatInclusiveDates()}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Destination */}
      <div className="mb-2">
        <p className="text-[10px]">
          <span className="font-bold">Destination/s:</span> {order.destinations || ''}
        </p>
      </div>

      {/* Purpose */}
      <div className="mb-3">
        <p className="text-[10px]">
          <span className="font-bold">Purpose of Travel:</span> {order.purpose || ''}
        </p>
      </div>

      {/* Travel Expenses Section */}
      <table className="w-full border-collapse border border-black mb-2">
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1 text-[9px] w-1/2 align-top">
              <p className="font-bold mb-1">Travel Expenses to be Incurred:</p>
              <div className="space-y-1">
                <p>
                  <span className="inline-block w-4 h-4 border border-black text-center text-[8px] mr-1 align-middle">
                    {order.expense_type === 'general_fund' ? 'X' : ''}
                  </span>
                  General Fund
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-black text-center text-[8px] mr-1 align-middle">
                    {order.expense_type === 'others' ? 'X' : ''}
                  </span>
                  Others: {order.expense_type === 'others' ? `(e.g. ${order.expense_type_other || 'sponsor/requesting agency'})` : '(e.g. sponsor/requesting agency)'}
                </p>
              </div>
            </td>
            <td className="border border-black px-2 py-1 text-[9px] w-1/2 align-top">
              <p className="font-bold mb-1">Appropriation/Fund to which travel expenses would be charged to:</p>
              <div className="space-y-1">
                <p>
                  <span className="inline-block w-4 h-4 border border-black text-center text-[8px] mr-1 align-middle">
                    {order.expense_type === 'project_funds' ? 'X' : ''}
                  </span>
                  Project Funds
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Actual vs Per Diem Section */}
      <table className="w-full border-collapse border border-black mb-2">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-[9px] w-1/3"></th>
            <th className="border border-black px-2 py-1 text-[9px] w-1/3 text-center">Actual</th>
            <th className="border border-black px-2 py-1 text-[9px] w-1/3 text-center">Per Diem</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]">Food</td>
            <td className="border border-black px-2 py-1 text-[9px] text-center">{order.has_actual_expenses ? '' : ''}</td>
            <td className="border border-black px-2 py-1 text-[9px]">Accommodation</td>
          </tr>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]">Transportation</td>
            <td className="border border-black px-2 py-1 text-[9px] text-center"></td>
            <td className="border border-black px-2 py-1 text-[9px]">Meals/Food</td>
          </tr>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]">Accommodation</td>
            <td className="border border-black px-2 py-1 text-[9px] text-center"></td>
            <td className="border border-black px-2 py-1 text-[9px]">Incidental expenses</td>
          </tr>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]">
              <span className="inline-block w-3 h-3 border border-black text-center text-[7px] mr-1 align-middle">
                {order.transportation_type === 'official_vehicle' ? 'X' : ''}
              </span>
              Transportation
            </td>
            <td className="border border-black px-2 py-1 text-[9px]">
              Official Vehicle
              <span className="inline-block w-3 h-3 border border-black text-center text-[7px] ml-1 align-middle">
                {order.transportation_type === 'official_vehicle' ? 'X' : ''}
              </span>
            </td>
            <td className="border border-black px-2 py-1 text-[9px]"></td>
          </tr>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]"></td>
            <td className="border border-black px-2 py-1 text-[9px]">
              Public Conveyance
              <span className="inline-block w-3 h-3 border border-black text-center text-[7px] ml-1 align-middle">
                {order.transportation_type === 'public_conveyance' ? 'X' : ''}
              </span>
            </td>
            <td className="border border-black px-2 py-1 text-[9px]">(Airplane, Bus, Taxi)</td>
          </tr>
          <tr className="h-[16px]">
            <td className="border border-black px-2 py-1 text-[9px]">
              <span className="inline-block w-3 h-3 border border-black text-center text-[7px] mr-1 align-middle"></span>
              Others
            </td>
            <td className="border border-black px-2 py-1 text-[9px]"></td>
            <td className="border border-black px-2 py-1 text-[9px]"></td>
          </tr>
        </tbody>
      </table>

      {/* Remarks Section */}
      <div className="border border-black p-2 mb-3">
        <p className="font-bold text-[9px] mb-1">Remarks/ Special Instructions</p>
        <p className="text-[8px] leading-snug">
          {order.remarks || 'A report of your travel must be submitted to the Agency Head/ Supervising official within 7 days from completion of travel. Liquidation of cash advance should be in accordance with Executive Order No. 298: Rules and Regulations and New Rates of Allowances for Official Local and foreign Travels of Government Personnel.'}
        </p>
      </div>

      {/* Approval Section */}
      <div className="flex justify-end mt-4">
        <div className="text-center">
          <p className="text-[10px] mb-6">Approved by:</p>
          <div className="border-b border-black w-48 mb-1"></div>
          <p className="font-bold text-[10px]">{order.approved_by?.toUpperCase() || ''}</p>
          <p className="text-[9px]">{order.approved_by_position || ''}</p>
        </div>
      </div>
    </div>
  );
}
