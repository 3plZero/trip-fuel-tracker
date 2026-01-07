import { format } from 'date-fns';
import dostLogo from '@/assets/dost-car-logo.jpg';
import isoLogo from '@/assets/iso-certification.jpg';

interface TripTicket {
  id: string;
  tr_no: string;
  ticket_date: string;
  status: string;
  purpose: string | null;
  balance_tank_start: number;
  issued_from_stock: number;
  purchased_outside: number;
  gasoline_used: number;
  balance_tank_end: number;
  gear_oil_used: number;
  motor_oil_used: number;
  brake_fluid_used: number;
  grease_used: number;
  total_distance: number;
  vehicles: { plate_no: string; description: string | null } | null;
  drivers: { full_name: string } | null;
}

interface Passenger {
  id: string;
  passenger_name: string;
}

interface Destination {
  id: string;
  destination: string;
}

interface TripDetail {
  id: string;
  trip_no: number;
  trip_date: string | null;
  departure_time: string | null;
  departure_place: string | null;
  arrival_time: string | null;
  arrival_place: string | null;
  odometer_initial: number | null;
  odometer_end: number | null;
}

interface TripTicketPrintLayoutProps {
  ticket: TripTicket;
  passengers: Passenger[];
  destinations: Destination[];
  tripDetails: TripDetail[];
}

export default function TripTicketPrintLayout({
  ticket,
  passengers,
  destinations,
  tripDetails,
}: TripTicketPrintLayoutProps) {
  // Create arrays with 9 slots for passengers and destinations
  const passengerSlots = Array.from({ length: 9 }, (_, i) => passengers[i]?.passenger_name || '');
  const destinationSlots = Array.from({ length: 9 }, (_, i) => destinations[i]?.destination || '');

  // Get odometer readings
  const initialReading = tripDetails.length > 0 ? tripDetails[0]?.odometer_initial : null;
  const endReading = tripDetails.length > 0 ? tripDetails[tripDetails.length - 1]?.odometer_end : null;

  return (
    <div className="print-layout bg-white text-black p-4 text-[9px] leading-none max-w-[8.5in] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={dostLogo} alt="DOST Logo" className="w-10 h-10 object-contain" />
          <div className="text-center">
            <p className="font-bold text-[11px]">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
            <p className="text-[9px]">Cordillera Administrative Region</p>
            <p className="text-[8px]">Km.6, La Trinidad, Benguet</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <img src={isoLogo} alt="ISO Certification" className="w-10 h-10 object-contain" />
          <div className="text-[7px] text-right">
            <p className="font-bold">CERTIFICATION</p>
            <p>INTERNATIONAL</p>
            <p>ISO 9001:2015</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center font-bold text-[12px] mb-2">VEHICLE TRIP TICKET</h1>

      {/* Instructions and TR No */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-[7px] flex-1 leading-tight">
          <p className="font-bold">INSTRUCTIONS:</p>
          <p>1. To be filled in triplicate by the person requesting use of vehicle.</p>
          <p>2. Original to driver to be returned to the Administrative Services upon completion.</p>
          <p>3. Duplicate to Administrative Services for control.</p>
        </div>
        <div className="border border-black px-3 py-1 ml-2">
          <span className="font-bold text-[9px]">TR No.</span>
          <span className="ml-2 font-bold text-[9px]">{ticket.tr_no}</span>
        </div>
      </div>

      {/* Date, Driver, Plate No */}
      <table className="w-full border-collapse border border-black mb-1">
        <tbody>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold w-12">Date</td>
            <td className="border border-black px-1 py-0.5">{format(new Date(ticket.ticket_date), 'MMMM d, yyyy')}</td>
            <td className="border border-black px-1 py-0.5 font-bold w-14">DRIVER</td>
            <td className="border border-black px-1 py-0.5">{ticket.drivers?.full_name || ''}</td>
            <td className="border border-black px-1 py-0.5 font-bold w-16">PLATE No.</td>
            <td className="border border-black px-1 py-0.5">{ticket.vehicles?.plate_no || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Authorized Passengers - 3 column layout */}
      <p className="font-bold mb-0.5 text-[8px]">Authorized Passengers:</p>
      <table className="w-full border-collapse border border-black mb-1">
        <tbody>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">1</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[0]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">4</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[3]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">7</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[6]}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">2</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[1]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">5</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[4]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">8</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[7]}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">3</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[2]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">6</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[5]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">9</td>
            <td className="border border-black px-1 py-0.5">{passengerSlots[8]}</td>
          </tr>
        </tbody>
      </table>

      {/* Destinations - 3 column layout */}
      <p className="font-bold mb-0.5 text-[8px]">Destinations:</p>
      <table className="w-full border-collapse border border-black mb-1">
        <tbody>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">1</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[0]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">4</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[3]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">7</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[6]}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">2</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[1]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">5</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[4]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">8</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[7]}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">3</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[2]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">6</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[5]}</td>
            <td className="border border-black px-1 py-0.5 w-4 text-center">9</td>
            <td className="border border-black px-1 py-0.5">{destinationSlots[8]}</td>
          </tr>
        </tbody>
      </table>

      {/* Purpose */}
      <p className="font-bold mb-0.5 text-[8px]">Purpose/s:</p>
      <table className="w-full border-collapse border border-black mb-1">
        <tbody>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">1</td>
            <td className="border border-black px-1 py-0.5">{ticket.purpose || ''}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 w-4 text-center">2</td>
            <td className="border border-black px-1 py-0.5">&nbsp;</td>
          </tr>
        </tbody>
      </table>

      {/* Authorized By */}
      <div className="flex justify-end mb-2">
        <div className="text-center">
          <p className="text-[8px]">AUTHORIZED BY:</p>
          <div className="border-b border-black w-40 h-4"></div>
          <p className="text-[8px] font-bold">SHEILA MARIE B. SINGA-CLAVER</p>
          <p className="text-[7px]">PSTD-BENGUET</p>
        </div>
      </div>

      {/* Trip Details Section */}
      <p className="font-bold text-center text-[8px] mb-1">TO BE FILLED ONLY BY THE DRIVER AFTER END OF TRIP</p>
      <table className="w-full border-collapse border border-black mb-1">
        <thead>
          <tr>
            <th className="border border-black px-1 py-0.5 text-center text-[8px]" rowSpan={2}>DATE</th>
            <th className="border border-black px-1 py-0.5 text-center text-[8px]" rowSpan={2}>TRIP NO.</th>
            <th className="border border-black px-1 py-0.5 text-center text-[8px]" colSpan={2}>DEPARTURE</th>
            <th className="border border-black px-1 py-0.5 text-center text-[8px]" colSpan={2}>ARRIVAL</th>
            <th className="border border-black px-1 py-0.5 text-center text-[8px]" rowSpan={2}>ODOMETER READING</th>
          </tr>
          <tr>
            <th className="border border-black px-1 py-0.5 text-center text-[7px]">TIME</th>
            <th className="border border-black px-1 py-0.5 text-center text-[7px]">PLACE</th>
            <th className="border border-black px-1 py-0.5 text-center text-[7px]">TIME</th>
            <th className="border border-black px-1 py-0.5 text-center text-[7px]">PLACE</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(4, tripDetails.length) }, (_, i) => {
            const detail = tripDetails[i];
            const isFirst = i === 0;
            const isSecond = i === 1;
            return (
              <tr key={i}>
                <td className="border border-black px-1 py-0.5 text-center text-[8px]">
                  {detail?.trip_date ? format(new Date(detail.trip_date), 'M/d/yy') : ''}
                </td>
                <td className="border border-black px-1 py-0.5 text-center text-[8px]">{detail?.trip_no || ''}</td>
                <td className="border border-black px-1 py-0.5 text-center text-[8px]">{detail?.departure_time || ''}</td>
                <td className="border border-black px-1 py-0.5 text-[8px]">{detail?.departure_place || ''}</td>
                <td className="border border-black px-1 py-0.5 text-center text-[8px]">{detail?.arrival_time || ''}</td>
                <td className="border border-black px-1 py-0.5 text-[8px]">{detail?.arrival_place || ''}</td>
                <td className="border border-black px-1 py-0.5 text-right text-[7px]">
                  {isFirst && (
                    <div className="flex justify-between items-center">
                      <span>1. Initial Reading</span>
                      <span className="font-bold">{initialReading ?? ''}</span>
                    </div>
                  )}
                  {isSecond && (
                    <div className="flex justify-between items-center">
                      <span>2. End of Trip</span>
                      <span className="font-bold">{endReading ?? ''}</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Gasoline Used and Certification */}
      <div className="flex gap-2 mb-1">
        <div className="flex-1">
          <p className="font-bold text-[8px] mb-0.5">GASOLINE USED:</p>
          <div className="grid grid-cols-2 gap-x-2 text-[8px] leading-tight">
            <p>Balance Tank <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.balance_tank_start || ''}</span> liters</p>
            <p>Issued from Stock <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.issued_from_stock || ''}</span> liters</p>
            <p>Purchased outside <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.purchased_outside || ''}</span> liters</p>
            <p>Gasoline Used <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.gasoline_used || ''}</span> liters</p>
            <p>Balance in Tank <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.balance_tank_end || ''}</span> liters</p>
            <p>Gear Oil put in <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.gear_oil_used || ''}</span> liters</p>
            <p>Motor Oil Put In <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.motor_oil_used || ''}</span> liters</p>
            <p>Brake Fluid out in <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.brake_fluid_used || ''}</span> liters</p>
            <p>Greased Used <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.grease_used || ''}</span> liters</p>
            <p>Total Est. Distance Traveled <span className="float-right border-b border-black inline-block w-12 text-right">{ticket.total_distance || ''}</span> kms.</p>
          </div>
        </div>
        <div className="w-48 text-center">
          <p className="text-[8px] mb-3">I certify to the correction on the above statement of record of travel.</p>
          <div className="border-b border-black mb-0.5 h-3"></div>
          <p className="text-[8px] font-bold">{ticket.drivers?.full_name?.toUpperCase() || ''}</p>
          <p className="text-[7px]">(Driver)</p>
        </div>
      </div>

      {/* Passengers Certification */}
      <div className="mb-1">
        <p className="text-[8px]">I/We certify that I/we used this vehicle on official business as stated above.</p>
        <p className="font-bold text-[8px]">PASSENGERS:</p>
        <table className="w-full border-collapse border border-black mt-0.5">
          <tbody>
            <tr>
              <td className="border border-black px-1 py-1 w-1/2">&nbsp;</td>
              <td className="border border-black px-1 py-1 w-1/2">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="text-[7px] border-t border-black pt-1 leading-tight">
        <p className="font-bold">NOTE: TO ALL OFFICIAL DRIVERS AND REQUESTING PARTIES</p>
        <p>1. Be sure that the official vehicle must be cleaned every after use before returning it to the Regional Office.</p>
        <p>2. Do not leave unnecessary things/ materials inside the official vehicle.</p>
        <p>3. Fill-up the trip ticket completely and accurately (fuel consumption, distance traveled, etc.)</p>
      </div>
    </div>
  );
}
