# mua — Bot Auto Mua

## Chạy

```bat
NinjaLite.bat   :: java -jar ninja_mua.jar
```

## Config

- `muado.txt`: mỗi dòng `[SV][TK][ITEM][MAP][POS][CHAT]`
  - `SV`: server id, `TK/MK`: tài khoản, `ITEM`: tên file trong `items/` (vd `sv5`), `MAP`/`POS`: vị trí đứng.
  - `CHAT`: tên file trong `chat/` không đuôi.
- `items/sv*.txt`: `id:gia` mỗi dòng, vd `6:5200` (id vật phẩm : giá mua).
- `chat/*.txt`: nội dung chat spam mua.
- `NinjaLite/GomItem/`: runtime NSO (DataDecode, map, env.json). `logs/` và `rms_data/` tự sinh, đã ignore.

## Files

- `ninja_mua.jar` — jar mua (trước là `ninja_crack.jar`)
- `cfr.jar` — decompiler
- `Class_av.class`, `readme.txt` — legacy
