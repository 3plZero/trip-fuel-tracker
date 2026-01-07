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
    <div className="print-layout bg-white text-black p-6 text-[10px] leading-tight max-w-[8.5in] mx-auto font-serif">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={dostLogo} alt="DOST Logo" className="w-14 h-14 object-contain" />
          <div className="text-left">
            <p className="font-bold text-[12px]">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
            <p className="text-[11px] italic">Cordillera Administrative Region</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-[8px] leading-tight">
            <p className="font-bold">CERTIFICATION</p>
            <p className="font-bold">INTERNATIONAL</p>
            <p className="font-bold">ISO 9001:2015</p>
            <p className="text-[7px]">Cert. No. CIP/4213/09/01/615</p>
          </div>
          <img src={isoLogo} alt="ISO Certification" className="w-12 h-12 object-contain" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center font-bold text-[14px] mb-3 underline">VEHICLE TRIP TICKET</h1>

      {/* Instructions */}
      <div className="mb-3 text-[9px]">
        <p className="font-bold">INSTRUCTIONS:</p>
        <p className="ml-2">1. To be filled in triplicate by the person requesting use of vehicle.</p>
        <p className="ml-2">2. Original to driver to be returned to the Administrative Services upon completion.</p>
        <p className="ml-2">3. Duplicate to Administrative Services for control.</p>
      </div>

      {/* Date, Driver, Plate No */}
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <tbody>
          <tr className="h-[22px]">
            <td className="border border-black px-2 font-bold w-[8%]">Date:</td>
            <td className="border border-black px-2 w-[25%]">{format(new Date(ticket.ticket_date), 'MMMM d, yyyy')}</td>
            <td className="border border-black px-2 font-bold w-[10%]">DRIVER:</td>
            <td className="border border-black px-2 w-[25%]">{ticket.drivers?.full_name || ''}</td>
            <td className="border border-black px-2 font-bold w-[12%]">PLATE No.:</td>
            <td className="border border-black px-2 w-[20%]">{ticket.vehicles?.plate_no || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Authorized Passengers - 3 column layout */}
      <p className="font-bold mb-1 text-[10px]">Authorized Passengers:</p>
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <tbody>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">1</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[0]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">4</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[3]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">7</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[6]}</td>
          </tr>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">2</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[1]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">5</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[4]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">8</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[7]}</td>
          </tr>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">3</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[2]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">6</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[5]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">9</td>
            <td className="border border-black px-2 w-[29%]">{passengerSlots[8]}</td>
          </tr>
        </tbody>
      </table>

      {/* Destinations - 3 column layout */}
      <p className="font-bold mb-1 text-[10px]">Destinations:</p>
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <tbody>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">1</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[0]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">4</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[3]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">7</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[6]}</td>
          </tr>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">2</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[1]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">5</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[4]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">8</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[7]}</td>
          </tr>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">3</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[2]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">6</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[5]}</td>
            <td className="border border-black px-1 w-[4%] text-center font-bold">9</td>
            <td className="border border-black px-2 w-[29%]">{destinationSlots[8]}</td>
          </tr>
        </tbody>
      </table>

      {/* Purpose */}
      <p className="font-bold mb-1 text-[10px]">Purpose/s:</p>
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <tbody>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">1</td>
            <td className="border border-black px-2">{ticket.purpose || ''}</td>
          </tr>
          <tr className="h-[18px]">
            <td className="border border-black px-1 w-[4%] text-center font-bold">2</td>
            <td className="border border-black px-2">&nbsp;</td>
          </tr>
        </tbody>
      </table>

      {/* Authorized By */}
      <div className="flex justify-end mb-3">
        <div className="text-center">
          <p className="text-[10px] mb-1">AUTHORIZED BY:</p>
          <div className="border-b border-black w-48 h-5"></div>
          <p className="text-[9px] mt-1">Signature Over Printed Name/Division</p>
        </div>
      </div>

      {/* Trip Details Section */}
      <p className="font-bold text-center text-[10px] mb-2 border border-black py-1 bg-gray-100">TO BE FILLED ONLY BY THE DRIVER AFTER END OF TRIP</p>
      <table className="w-full border-collapse border border-black mb-2 table-fixed">
        <thead>
          <tr>
            <th className="border border-black px-1 text-center text-[9px] w-[12%]" rowSpan={2}>DATE</th>
            <th className="border border-black px-1 text-center text-[9px] w-[8%]" rowSpan={2}>TRIP NO.</th>
            <th className="border border-black px-1 text-center text-[9px]" colSpan={2}>DEPARTURE</th>
            <th className="border border-black px-1 text-center text-[9px]" colSpan={2}>ARRIVAL</th>
            <th className="border border-black px-1 text-center text-[9px] w-[22%]" rowSpan={2}>ODOMETER READING</th>
          </tr>
          <tr>
            <th className="border border-black px-1 text-center text-[8px] w-[10%]">TIME</th>
            <th className="border border-black px-1 text-center text-[8px] w-[14%]">PLACE</th>
            <th className="border border-black px-1 text-center text-[8px] w-[10%]">TIME</th>
            <th className="border border-black px-1 text-center text-[8px] w-[14%]">PLACE</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }, (_, i) => {
            const detail = tripDetails[i];
            const isFirst = i === 0;
            const isSecond = i === 1;
            return (
              <tr key={i} className="h-[20px]">
                <td className="border border-black px-1 text-center text-[9px]">
                  {detail?.trip_date ? format(new Date(detail.trip_date), 'M/d/yy') : ''}
                </td>
                <td className="border border-black px-1 text-center text-[9px]">{detail?.trip_no || ''}</td>
                <td className="border border-black px-1 text-center text-[9px]">{detail?.departure_time || ''}</td>
                <td className="border border-black px-1 text-[9px] truncate">{detail?.departure_place || ''}</td>
                <td className="border border-black px-1 text-center text-[9px]">{detail?.arrival_time || ''}</td>
                <td className="border border-black px-1 text-[9px] truncate">{detail?.arrival_place || ''}</td>
                <td className="border border-black px-1 text-[8px]">
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

      {/* Gasoline Used and Driver Certification */}
      <div className="flex gap-4 mb-2">
        <div className="flex-1">
          <p className="font-bold text-[10px] mb-1">GASOLINE USED:</p>
          <table className="w-full text-[9px]">
            <tbody>
              <tr>
                <td className="pr-2">Balance Tank</td>
                <td className="border-b border-black text-right w-16">{ticket.balance_tank_start || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Issued from Stock</td>
                <td className="border-b border-black text-right w-16">{ticket.issued_from_stock || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Purchased outside</td>
                <td className="border-b border-black text-right w-16">{ticket.purchased_outside || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Gasoline Used</td>
                <td className="border-b border-black text-right w-16">{ticket.gasoline_used || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Balance in Tank</td>
                <td className="border-b border-black text-right w-16">{ticket.balance_tank_end || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Gear Oil put in</td>
                <td className="border-b border-black text-right w-16">{ticket.gear_oil_used || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Motor Oil Put In</td>
                <td className="border-b border-black text-right w-16">{ticket.motor_oil_used || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Brake Fluid out in</td>
                <td className="border-b border-black text-right w-16">{ticket.brake_fluid_used || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2">Greased Used</td>
                <td className="border-b border-black text-right w-16">{ticket.grease_used || ''}</td>
                <td className="pl-1">liters</td>
              </tr>
              <tr>
                <td className="pr-2 font-bold">Total Est. Distance Traveled</td>
                <td className="border-b border-black text-right w-16 font-bold">{ticket.total_distance || ''}</td>
                <td className="pl-1">kms.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-52 text-center">
          <p className="text-[9px] mb-4 leading-snug">I certify to the correction on the above statement of record of travel.</p>
          <div className="border-b border-black mb-1 h-6"></div>
          <p className="text-[10px] font-bold">{ticket.drivers?.full_name?.toUpperCase() || ''}</p>
          <p className="text-[8px]">(Driver)</p>
        </div>
      </div>

      {/* Passengers Certification */}
      <div className="mb-2">
        <p className="text-[9px] mb-1">I/We certify that I/we used this vehicle on official business as stated above.</p>
        <p className="font-bold text-[10px]">PASSENGERS:</p>
        <table className="w-full border-collapse border border-black mt-1">
          <tbody>
            <tr>
              <td className="border border-black px-2 py-2 w-1/2 h-8">&nbsp;</td>
              <td className="border border-black px-2 py-2 w-1/2 h-8">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="text-[8px] border-t border-black pt-2 leading-snug">
        <p className="font-bold">NOTE: TO ALL OFFICIAL DRIVERS AND REQUESTING PARTIES</p>
        <p className="ml-2">1. Be sure that the official vehicle must be cleaned every after use before returning it to the Regional Office.</p>
        <p className="ml-2">2. Do not leave unnecessary things/materials inside the official vehicle.</p>
        <p className="ml-2">3. Fill-up the trip ticket completely and accurately (fuel consumption, distance traveled, etc.)</p>
      </div>
    </div>
  );
}
