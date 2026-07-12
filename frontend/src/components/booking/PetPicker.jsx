/**
 * Hiển thị danh sách pet đã lưu của 1 customer (đã đăng nhập hoặc đã nhận diện qua SĐT)
 * để khách chọn đặt lịch cho pet nào, hoặc chọn "Thêm thú cưng mới".
 *
 * pets: mảng row gốc từ bảng `pet` (pet_id, pet_name, ...).
 * selectedPetId: pet_id đang chọn, hoặc null nếu đang ở chế độ "thêm mới".
 * onSelect(petId | null)
 */
export default function PetPicker({ pets = [], selectedPetId, onSelect }) {
  if (!pets.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-wood-bark/80">Đặt lịch cho thú cưng nào?</label>
      <div className="flex flex-wrap gap-2">
        {pets.map((pet) => {
          const active = selectedPetId === pet.pet_id;
          return (
            <button
              key={pet.pet_id}
              type="button"
              onClick={() => onSelect(pet.pet_id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-understory text-white border-understory'
                  : 'border-wood-bark/20 text-wood-bark/70 hover:border-understory/40'
              }`}
            >
              🐾 {pet.pet_name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium border border-dashed transition-colors ${
            selectedPetId === null
              ? 'bg-understory text-white border-understory'
              : 'border-wood-bark/30 text-wood-bark/70 hover:border-understory/40'
          }`}
        >
          + Thêm thú cưng mới
        </button>
      </div>
    </div>
  );
}