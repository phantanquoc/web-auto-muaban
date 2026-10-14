# web_mua_ban — Bot Mua & Bán Ninja School Online

Repo chứa 2 bot chạy độc lập: **mua** (auto mua) và **ban** (auto bán + quản lý rương).

## Cấu trúc

```
mua/   — Bot mua
  muado.txt, items/sv*.txt, chat/, logs/, NinjaLite/, NinjaLite.bat -> ninja_mua.jar
ban/   — Bot bán
  banvatpham.txt, items/sv*.txt, patcher/, NinjaLite/, NinjaBan.bat -> ninja_ban.jar
```

## Chạy

```bat
:: Bot mua
cd mua
NinjaLite.bat        :: -> java -jar ninja_mua.jar

:: Bot bán
cd ban
NinjaBan.bat         :: -> java -jar ninja_ban.jar
```

Mỗi `.bat` đã `CD /D "%~dp0"` nên `Class_cu.g` = thư mục chứa jar. Config `muado.txt`/`banvatpham.txt` và `items/` phải nằm cạnh jar.

## Config

- **Mua** `mua/muado.txt`: dòng `[SV]5[/SV][TK]...[/TK][ITEM]sv5[/ITEM][MAP]...[/MAP][POS]...[/POS][CHAT]...[/CHAT]`
  - `items/sv5.txt` format `id:gia` (vd `6:5200`)
- **Bán** `ban/banvatpham.txt`: `[SV]6[/SV][TK]...[/TK][ITEM]sv6_da[/ITEM][MAP]...[/MAP][POS]...[/POS]`
  - `items/sv6_da.txt` format `id:donGia:maxQty:maVp` (vd `6:20000:999:d7`)

## Patcher (chỉ ban)

`ban/patcher/` — source patch jar: `BanSeller.java`, `StorageTester.java`, `Class_cp_edit.java`, `Class_cw_edit.java`, `Class_cx_edit.java`, `fix_cq.py`.

```bat
cd ban/patcher
python fix_cq.py   :: Class_cq_work.java -> Class_cq_fixed.java (cần work/Class_cq_work.java)
```

## Lưu ý

- `NinjaLite/GomItem/logs/`, `rms_data/`, `*.class`, `*.jar.bak-*` đã ignore.
- Hai bot ghi log ra `C:/NinjaLite/GomItem/logs/` (hardcode) và `NinjaLite/GomItem/logs/` cạnh jar — chạy cùng lúc không đè config nhưng chung log hardcode.
