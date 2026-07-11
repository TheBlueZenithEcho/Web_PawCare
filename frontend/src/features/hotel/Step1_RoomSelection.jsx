import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { SPECIES_FILTER, WEIGHT_BRACKETS } from '../../../src/constants/hotel';
import { getRooms, isRoomAvailable } from '../../services/supabase/customer/booking/hotelService';
import { formatVND } from '../../../src/utils/format';

export default function Step1_RoomSelection({ booking, setBooking, onNext, lock }) {
  const [species, setSpecies] = useState('dog');
  const [weightBracket, setWeightBracket] = useState('under10');
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState({}); // room_id -> boolean
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bracket = WEIGHT_BRACKETS.find((w) => w.id === weightBracket) || WEIGHT_BRACKETS[3];
  const nightsSelected = Boolean(booking.checkIn && booking.checkOut);

  useEffect(() => {
    setLoading(true);
    getRooms({ species, maxWeight: bracket.max })
      .then(setRooms)
      .catch((e) => {
        console.error(e);
        setError('Không tải được danh sách phòng. Kiểm tra kết nối Supabase.');
      })
      .finally(() => setLoading(false));
  }, [species, weightBracket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check trống lịch cho từng phòng khi đã chọn đủ ngày check-in/out
  useEffect(() => {
    if (!nightsSelected || rooms.length === 0) return;
    Promise.all(
      rooms.map((r) => isRoomAvailable(r.room_id, booking.checkIn, booking.checkOut).then((ok) => [r.room_id, ok]))
    ).then((entries) => setAvailability(Object.fromEntries(entries)));
  }, [rooms, booking.checkIn, booking.checkOut, nightsSelected]);

  const update = (patch) => setBooking((prev) => ({ ...prev, ...patch }));

  const handlePickRoom = (room) => {
    update({ roomId: room.room_id });
    lock.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center max-w-2xl mx-auto pt-4">
        <h1 className="text-4xl font-bold text-wood-bark leading-tight">
          Nơi cư trú lý tưởng cho <span className="text-understory">thú cưng</span> của bạn
        </h1>
        <p className="text-wood-bark/60 mt-3">
          Trải nghiệm dịch vụ lưu trú cao cấp. Chăm sóc riêng biệt, phòng rộng rãi, an tâm tuyệt đối.
        </p>
      </section>

      {error && (
        <div className="max-w-2xl mx-auto w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm p-5 max-w-4xl mx-auto w-full grid sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Loài</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full bg-fresh-grown/20 rounded-xl px-3 py-2.5 text-sm font-medium outline-none">
            {SPECIES_FILTER.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Cân nặng thú cưng</label>
          <select value={weightBracket} onChange={(e) => setWeightBracket(e.target.value)} className="w-full bg-fresh-grown/20 rounded-xl px-3 py-2.5 text-sm font-medium outline-none">
            {WEIGHT_BRACKETS.map((w) => (
              <option key={w.id} value={w.id}>{w.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Nhận phòng</label>
          <input type="date" value={booking.checkIn} onChange={(e) => update({ checkIn: e.target.value })} className="w-full bg-fresh-grown/20 rounded-xl px-3 py-2.5 text-sm font-medium outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Trả phòng</label>
          <input type="date" value={booking.checkOut} min={booking.checkIn || undefined} onChange={(e) => update({ checkOut: e.target.value })} className="w-full bg-fresh-grown/20 rounded-xl px-3 py-2.5 text-sm font-medium outline-none" />
        </div>
      </div>

      {!nightsSelected && (
        <p className="text-center text-xs text-wood-bark/50 -mt-4">
          Vui lòng chọn ngày nhận phòng / trả phòng để kiểm tra phòng còn trống.
        </p>
      )}

      <div className="max-w-md mx-auto w-full flex items-center gap-3 bg-fresh-grown/30 rounded-2xl px-4 py-3">
        <Calendar size={18} className="text-understory shrink-0" />
        <p className="text-xs text-wood-bark/70">
          <strong>Bộ lọc cân nặng tự động</strong> — Đang hiển thị phòng phù hợp {bracket.label.toLowerCase()}.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-wood-bark mb-1">Hệ thống phòng đặc biệt</h2>
        <p className="text-sm text-wood-bark/60 mb-5">Mỗi phòng đều có giám sát 24/7, kiểm soát nhiệt độ và đệm chỉnh hình.</p>

        {loading ? (
          <p className="text-sm text-wood-bark/50 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Đang tải danh sách phòng...
          </p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const isSelected = booking.roomId === room.room_id;
              const isAvailable = !nightsSelected || availability[room.room_id] !== false;
              return (
                <div key={room.room_id} className={`bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col ${isSelected ? 'ring-2 ring-fresh-grown shadow-lg' : ''}`}>
                  <div className="h-40 bg-fresh-grown/30 relative flex items-center justify-center">
                    <span className="text-understory/50 text-sm">Hình ảnh phòng</span>
                    {nightsSelected && (
                      <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${isAvailable ? 'bg-understory text-white' : 'bg-orange-500 text-white'}`}>
                        {isAvailable ? 'Còn trống' : 'Đã kín lịch'}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-wood-bark text-lg">Phòng {room.room_id}</h3>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-understory">{formatVND(room.price_per_night)}</p>
                        <p className="text-[10px] text-wood-bark/50 uppercase">mỗi đêm</p>
                      </div>
                    </div>
                    <p className="text-sm text-wood-bark/60 flex-1">
                      Phù hợp {room.suitable_species}, tối đa {room.max_weight}kg.
                    </p>
                    <button
                      onClick={() => handlePickRoom(room)}
                      disabled={!nightsSelected || !isAvailable}
                      className={`mt-2 w-full rounded-full py-3 text-sm font-bold transition-colors ${isSelected ? 'bg-wood-bark text-white' : 'bg-understory text-white hover:bg-wood-bark disabled:opacity-40'}`}
                    >
                      {isSelected ? 'Đã chọn ✓' : 'Đặt phòng ngay'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {booking.roomId && (
        <div className="flex justify-center">
          <button onClick={onNext} className="rounded-full bg-understory px-10 py-3.5 text-sm font-bold text-white hover:bg-wood-bark transition-colors">
            Tiếp tục điền thông tin →
          </button>
        </div>
      )}
    </div>
  );
}