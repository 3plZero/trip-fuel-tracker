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
      return `${format(start, 'MMMM d')}-${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  return (
    <div className="print-layout bg-white text-black p-8 text-[11px] leading-normal max-w-[8.5in] mx-auto font-serif">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <img src={dostLogo} alt="DOST Logo" className="w-16 h-16 object-contain" />
        <div className="text-center flex-1 px-4">
          <p className="text-[11px] italic">Republic of the Philippines</p>
          <p className="font-bold text-[13px] tracking-wide">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
          <p className="text-[11px] italic text-blue-700">Cordillera Administrative Region</p>
          <p className="text-[10px]">Km.6, La Trinidad, Benguet</p>
        </div>
        <div className="flex items-start gap-1">
          <img src={isoLogo} alt="ISO Certification" className="w-12 h-12 object-contain" />
          <div className="text-right text-[7px] leading-tight">
            <p className="font-bold">CERTIFICATION</p>
            <p className="font-bold">INTERNATIONAL</p>
          </div>
        </div>
      </div>

      {/* Date - right aligned */}
      <div className="text-right mb-6">
        <p className="text-[11px]">{format(new Date(order.order_date), 'MMMM d, yyyy')}</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <p className="font-bold text-[12px]">LOCAL TRAVEL ORDER No. {order.travel_order_no}</p>
      </div>

      {/* Authority Statement */}
      <p className="text-[11px] mb-3">Authority to Travel is hereby granted to:</p>

      {/* Personnel Section */}
      <div className="mb-4">
        <div className="flex border-b border-black pb-1 mb-1">
          <div className="w-[30%]">
            <p className="font-bold text-[10px]">NAME</p>
          </div>
          <div className="w-[15%]">
            <p className="font-bold text-[10px]">POSITION</p>
          </div>
          <div className="w-[25%]">
            <p className="font-bold text-[10px]">DIVISION/AGENCY</p>
          </div>
          <div className="w-[30%]">
            <p className="font-bold text-[10px]">Inclusive Date/s of Travel:</p>
          </div>
        </div>
        {personnel.length > 0 ? (
          personnel.map((person, index) => (
            <div key={index} className="flex">
              <div className="w-[30%]">
                <p className="text-[11px]">{person.name}</p>
              </div>
              <div className="w-[15%]">
                <p className="text-[11px]">{person.position || ''}</p>
              </div>
              <div className="w-[25%]">
                <p className="text-[11px]">{person.division_agency || ''}</p>
              </div>
              <div className="w-[30%]">
                {index === 0 && <p className="text-[11px]">{formatInclusiveDates()}</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="flex">
            <div className="w-[30%]"><p className="text-[11px]">&nbsp;</p></div>
            <div className="w-[15%]"><p className="text-[11px]">&nbsp;</p></div>
            <div className="w-[25%]"><p className="text-[11px]">&nbsp;</p></div>
            <div className="w-[30%]"><p className="text-[11px]">&nbsp;</p></div>
          </div>
        )}
      </div>

      {/* Destination and Purpose */}
      <div className="flex mb-4 mt-6 border-t border-black pt-2">
        <div className="w-[35%] pr-4">
          <p className="font-bold text-[10px] text-blue-700 mb-1">Destination/s:</p>
          <p className="text-[11px]">{order.destinations || ''}</p>
        </div>
        <div className="w-[25%] pr-4">
          <p className="font-bold text-[10px] text-blue-700 mb-1">Inclusive Date/s of Travel:</p>
          <p className="text-[11px]">{order.purpose ? `*${order.purpose.substring(0, 50)}` : ''}</p>
        </div>
        <div className="w-[40%]">
          <p className="font-bold text-[10px] text-blue-700 mb-1">Purpose of Travel:</p>
          <p className="text-[11px]">{order.purpose || ''}</p>
        </div>
      </div>

      {/* Travel Expenses Header */}
      <div className="flex mb-2 mt-6 border-t border-black pt-2">
        <div className="w-[25%]">
          <p className="font-bold text-[10px] text-blue-700">Travel Expenses to</p>
          <p className="font-bold text-[10px] text-blue-700">be Incurred:</p>
        </div>
        <div className="w-[75%]">
          <p className="font-bold text-[10px]">Appropriation/Fund to which travel expenses would be charged to:</p>
          <div className="flex gap-6 mt-1 text-[11px]">
            <span>({order.expense_type === 'general_fund' ? 'X' : ' '}) General Fund</span>
            <span>( ) Project Funds</span>
            <span>( ) Others: (e.g. sponsor/</span>
          </div>
          <p className="text-[10px] ml-72">requesting agency)</p>
        </div>
      </div>

      {/* Actual Section */}
      <div className="mb-1">
        <p className="text-[11px]">( ) <span className="font-bold">Actual</span></p>
        <div className="ml-12 text-[11px]">
          <p>Food</p>
          <p>Transportation</p>
          <p>Accommodation</p>
        </div>
      </div>

      {/* Per Diem Section */}
      <div className="mb-1">
        <p className="text-[11px]">( ) <span className="font-bold">Per Diem</span></p>
        <div className="ml-12 text-[11px]">
          <p>Accommodation</p>
          <p>Meals/Food</p>
          <p>Incidental expenses</p>
        </div>
      </div>

      {/* Transportation Section */}
      <div className="mb-1">
        <p className="text-[11px]">({order.transportation_type ? 'X' : ' '}) <span className="font-bold">Transportation</span></p>
        <div className="ml-12 text-[11px] flex">
          <div className="w-40">
            <p>Official Vehicle</p>
            <p>Public Conveyance</p>
            <p className="text-[10px]">(Airplane, Bus, Taxi)</p>
          </div>
          <div className="ml-4">
            <p>{order.transportation_type === 'official_vehicle' ? 'X' : ''}</p>
            <p>{order.transportation_type === 'public_conveyance' ? 'X' : ''}</p>
          </div>
        </div>
      </div>

      {/* Others Section */}
      <div className="mb-2">
        <p className="text-[11px]">( ) <span className="font-bold">Others</span></p>
        <p className="text-[11px]">Remarks/ Special Instructions</p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 mb-6 border-t border-black pt-2">
        <p className="text-[10px] italic leading-snug">
          A report of your travel must be submitted to the Agency Head/ Supervising official within 7 days from completion of
          travel. Liquidation of cash advance should be in accordance with Executive Order No. 298: Rules and Regulations and
          New Rates of Allowances for Official Local and foreign Travels of Government Personnel.
        </p>
      </div>

      {/* Approval Section */}
      <div className="mt-8 ml-8">
        <p className="text-[11px] mb-8">Approved by:</p>
        <div className="w-56">
          <div className="border-b border-black mb-0.5 h-6"></div>
          <p className="font-bold text-[11px]">{order.approved_by || ''}</p>
          <p className="text-[10px]">{order.approved_by_position || ''}</p>
        </div>
      </div>
    </div>
  );
}
