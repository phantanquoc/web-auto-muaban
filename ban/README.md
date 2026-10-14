# ban — Bot Auto Bán + Rương

## Chạy

```bat
NinjaBan.bat   :: java -jar ninja_ban.jar
```

## Config

- `banvatpham.txt`: `[SV]6[/SV][TK]...[/TK][ITEM]sv6_da[/ITEM][MAP]...[/MAP][POS]...[/POS]`
  - `ITEM` trỏ file trong `items/` (vd `sv6_da` -> `items/sv6_da.txt`).
- `items/sv*.txt`: `id:donGia:maxQty:maVp` mỗi dòng, vd `6:20000:999:d7`
  - `maVp`: mã vật phẩm khách gõ khi mua (vd `12 d7`), để trống thì không rao.
- `NinjaLite/GomItem/` runtime riêng cho bán.

## Patcher

`patcher/` — source để patch `ninja_ban.jar`:

- `BanSeller.java` — state machine bán (IDLE/WAITING/IN_TRADE/CONFIRMED), rương, broadcast, `testkho`.
- `StorageTester.java` — lệnh `testkho` kiểm tra rút rương opcode 16/15.
- `Class_cp_edit.java` / `Class_cw_edit.java` / `Class_cx_edit.java` — override GUI & trade.
- `Class_cq_ban.java` + `fix_cq.py` — fix CFR decompile + hooks `-22/45/57/58/8`.
- `BytePatcher.java`, `StringToHex.java`, `work/Class_cu.class` — tools.

```bat
cd patcher
python fix_cq.py   :: work/Class_cq_work.java -> work/Class_cq_fixed.java
```

## Flow bán

Khách chat riêng `12 d7` -> bot báo giá `12 x 20.000 = 240.000 xu` -> tách stack nếu cần -> mời giao dịch (opcode 43) -> khách bỏ xu (case 45) -> bot bỏ đồ + lock (0 xu) -> confirm khi đủ xu.
