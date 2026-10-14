When asked about the codebase, project structure, or to find code, always use the context-engine MCP tool (codebase-retrieval) in the root workspace first before reading individual files. Use `codebase-retrieval` instead of the Explore subagent for codebase exploration and search tasks.

## Project structure — Mua vs Ban

```
web_mua_ban/
├── mua/                      # Bot MUA (auto mua vật phẩm P2P)
│   ├── muado.txt             # [SV][TK][ITEM=sv1..sv6][MAP][POS][CHAT]
│   ├── items/sv1..sv6.txt    # Bảng giá mua, format: id:gia (vd 6:5200)
│   ├── chat/                 # Mẫu chat spam mua
│   ├── logs/                 # Log giao dịch mua (runtime, ignored)
│   ├── NinjaLite/GomItem/    # Runtime NSO: DataDecode, map, env.json (+ logs/rms_data ignored)
│   ├── NinjaLite.bat         # Launcher -> ninja_mua.jar
│   ├── ninja_mua.jar         # Jar mua (rename từ ninja_crack.jar)
│   ├── cfr.jar               # Decompiler tool
│   └── readme.txt
├── ban/                      # Bot BÁN (auto bán + rương)
│   ├── banvatpham.txt        # [SV][TK][ITEM=sv6_da][MAP][POS] — trỏ items/sv6_da.txt
│   ├── items/sv*.txt         # Bảng giá bán, format: id:donGia:maxQty:maVp (vd 6:20000:999:d7)
│   ├── patcher/              # Source bán: BanSeller.java, StorageTester.java, Class_cp/cw/cx_edit.java, fix_cq.py
│   ├── NinjaLite/GomItem/    # Runtime NSO riêng cho bán (tương tự mua)
│   ├── NinjaBan.bat          # Launcher -> ninja_ban.jar
│   └── ninja_ban.jar
├── openspec/                 # Spec storage-chest
├── .gitignore
└── README.md
```

- `Class_cu.g` (working dir) = thư mục chứa `.jar` đang chạy. Mỗi bot đọc `banvatpham.txt`/`muado.txt` và `items/` ngay cạnh jar, và ghi log vào `NinjaLite/GomItem/logs/` + `C:/NinjaLite/GomItem/` (hardcode). Hai bot chạy độc lập, không share file config.
- `chat/` trước đây duplicate 100% giữa mua/bán, nay tách riêng để mỗi bot tự quản mẫu chat.
