.PHONY: run hex
run:
	deno run --allow-all main.ts
hex:
	hexdump -C .git/index | head -n 20
