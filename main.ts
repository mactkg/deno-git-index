import { assertEquals } from "https://deno.land/std@0.215.0/assert/mod.ts";
import { BufReader } from "https://deno.land/std@0.161.0/io/mod.ts";

async function openGitIndex(path: URL) {
  const file = await Deno.open(path);
  const p = 0;
  await Deno.seek(file.rid, p, Deno.SeekMode.Start);

  // sig: DIRC
  const sig = new Uint8Array(4);
  await file.read(sig);
  const sigStr = uint8ArrayToString(sig);
  assertEquals(sigStr, "DIRC");
  console.log(sigStr);

  // Version
  const ver = new Uint8Array(4);
  await file.read(ver);
  console.log(`Version: ${ver[3]}`);

  // index entries
  const indexEntries = await readUint32(file, 1);
  console.log(`Indexed entries: ${indexEntries}`);

  // Index entry ==================================
  const ctimeSec = await readUint32(file, 1);
  console.log(`ctime seconds: ${ctimeSec}: ${new Date(ctimeSec[0] * 1000)}`);

  const ctimeNSec = await readUint32(file, 1);
  console.log(`ctime nseconds: ${ctimeNSec}`);

  const mtimeSec = await readUint32(file, 1);
  console.log(`mtime seconds: ${mtimeSec}: ${new Date(mtimeSec[0] * 1000)}`);

  const mtimeNSec = await readUint32(file, 1);
  console.log(`mtime nseconds: ${mtimeNSec}`);

  const dev = await readUint32(file, 1);
  console.log(`dev: ${dev}`);

  const ino = await readUint32(file, 1);
  console.log(`ino: ${ino}`);

  // skip
  const _mode = await readUint32(file, 1);
  console.log(`object type: ${_mode}`);
  const uid = await readUint32(file, 1);
  console.log(`uid: ${uid}`);
  const gid = await readUint32(file, 1);
  console.log(`gid: ${gid}`);
  const fileSize = await readUint32(file, 1);
  console.log(`fileSize: ${fileSize}`);
  const sha1 = await readUint8(file, 21);
  console.log(`sha1: ${getSha1String(sha1)}`);
  const fileName = await readlUntilNullUint8(file);
  console.log(`fileName: ${fileName ? uint8ArrayToString(fileName) : ""}`);
}

function getSha1String(arr: Uint8Array): string {
  assertEquals(arr.length, 21, "sha1 array should be 21 chars");
  return [...arr.slice(0, 20)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");
}

function uint8ArrayToString(arr: Uint8Array, label = "utf-8"): string {
  return new TextDecoder(label).decode(arr);
}

async function readUint8(file: Deno.FsFile, size: number): Promise<Uint8Array> {
  const buf = new Uint8Array(size);
  await file.read(buf);
  return buf;
}

async function readlUntilNullUint8(
  file: Deno.FsFile
): Promise<Uint8Array | null> {
  const reader = new BufReader(file);
  const res = await reader.readSlice(0);
  return res;
}

async function readUint16(
  file: Deno.FsFile,
  size: number
): Promise<Uint16Array> {
  const buf = new Uint8Array(size * 2);
  await file.read(buf);
  return new Uint16Array(buf.reverse().buffer);
}

async function readUint32(
  file: Deno.FsFile,
  size: number
): Promise<Uint32Array> {
  const buf = new Uint8Array(size * 4);
  await file.read(buf);
  return new Uint32Array(buf.reverse().buffer);
}

const url = new URL(`./.git/index`, import.meta.url);
await openGitIndex(url);
