const ITEM_CONTAINER = 15;
const MAX_BAG_ROWS = 5;

type Constructor<T> = new () => T;

function parseIntStrict(value: string): number {
  return Number.parseInt(value, 10);
}

function asciiFlagConv(flag: string): bigint {
  let flags = 0n;
  let isNum = true;

  for (const c of flag) {
    const code = c.charCodeAt(0);

    if (c >= "a" && c <= "z") {
      flags |= 1n << BigInt(code - "a".charCodeAt(0));
    } else if (c >= "A" && c <= "Z") {
      flags |= 1n << BigInt(26 + code - "A".charCodeAt(0));
    }

    if (!/^[0-9-]$/.test(c)) {
      isNum = false;
    }
  }

  if (isNum && flag.length > 0) {
    flags = BigInt(flag);
  }

  return flags;
}

function flagConv(flags: string[]): bigint {
  if (flags.length !== 4) {
    throw new Error("Expected 4 flags");
  }

  let result = 0n;
  for (const [i, flag] of flags.entries()) {
    result |= (asciiFlagConv(flag) & 0xffffffffn) << BigInt(32 * i);
  }
  return result;
}

export class FlagHandler {
  flags = 0n;
  array: bigint[] = [0n, 0n, 0n, 0n];

  asSet(): Set<number> {
    const result = new Set<number>();
    for (let i = 0; i < 128; i += 1) {
      if (this.flags & (1n << BigInt(i))) {
        result.add(i);
      }
    }
    return result;
  }

  loadFlags(flagsIn: string[]): void {
    this.flags = flagConv(flagsIn);
    this.array = flagsIn.map((flag) => asciiFlagConv(flag));
  }

  static fromFlagsList(flags: string[]): FlagHandler {
    const handler = new FlagHandler();
    handler.loadFlags(flags);
    return handler;
  }
}

export class Exit {
  toRoom = -1;
  keywords = "";
  description = "";
  exitInfo = 0;
  key: number | null = null;
  dclock = 0;
  dchide = 0;
}

export class ExtraDescription {
  constructor(
    public keywords = "",
    public description = "",
  ) {}
}

export class Room {
  id = -1;
  name = "";
  description = "";
  extraDescriptions: ExtraDescription[] = [];
  exits = new Map<number, Exit>();
  roomFlags = new FlagHandler();
  sectorType = 0;
  protoScript: number[] = [];
  zone = -1;
  contents: ObjectInstance[] = [];
}

export class Affected {
  location = 0;
  modifier = 0;
  specific = 0;
  affFlags = 0;
  type = 0;
  duration = 0;
  bitvector = 0;

  constructor(input: Partial<Affected> = {}) {
    Object.assign(this, input);
  }

  valid(): boolean {
    return this.location !== 0;
  }
}

export class ObjAffected {
  location = 0;
  specific = 0;
  modifier = 0;

  constructor(input: Partial<ObjAffected> = {}) {
    Object.assign(this, input);
  }
}

export class ObjectBase {
  itemType = -1;
  name = "";
  shortDescription = "";
  description = "";
  actionDescription = "";
  extraFlags = new FlagHandler();
  wearFlags = new FlagHandler();
  bitvector = new FlagHandler();
  extraDescriptions: ExtraDescription[] = [];
  values = new Map<number, number>();
  weight = 0;
  cost = 0;
  costPerDay = 0;
  level = 0;
  size = 0;
  affected: ObjAffected[] = [];
}

export class ObjectPrototype extends ObjectBase {
  id = -1;
  protoScript: number[] = [];
}

export class ObjectInstance extends ObjectBase {
  id = -1;
  objectPrototypeId = -1;
  createdAt = 0;
  carriedBy: Character | null = null;
  inRoom: Room | null = null;
  wornBy: Character | null = null;
  wornOn = 0;
  owner: Character | null = null;
  inObj: ObjectInstance | null = null;
  contains: ObjectInstance[] = [];
}

export class CharacterBase {
  name = "";
  shortDescr = "";
  longDescr = "";
  description = "";
  title = "";
  size = 0;
  race = 0;
  chclass = 0;
  sex = 0;
  act = new FlagHandler();
  affectedBy = new FlagHandler();
  level = 0;
  raceLevel = 0;
  levelAdj = 0;
  alignment = 0;
  strength = 0;
  intel = 0;
  wis = 0;
  dex = 0;
  con = 0;
  cha = 0;
  gold = 0;
  basepl = 0;
  basest = 0;
  baseki = 0;
  damageMod = 0;
  armor = 0;
}

export class CharacterPrototype extends CharacterBase {
  id = -1;
  defaultPosition = 0;
  protoScript: number[] = [];
  affected: Affected[] = [];
}

export class SkillData {
  level = 0;
  bonus = 0;
  perfs = 0;

  constructor(input: Partial<SkillData> = {}) {
    Object.assign(this, input);
  }
}

export class AliasData {
  alias = "";
  replacement = "";
  type = 0;

  constructor(input: Partial<AliasData> = {}) {
    Object.assign(this, input);
  }
}

export class Character extends CharacterBase {
  id = -1;
  androidModel: string | null = null;
  dgscriptVariables: Record<string, string> = {};
  adminLevel = 0;
  absorbs = 0;
  bankGold = 0;
  aura = 0;
  eye = 0;
  hairc = 0;
  hairl = 0;
  hairs = 0;
  distfea = 0;
  skin = 0;
  feature = "";
  voice = "";
  blesslvl = 0;
  bonuses: number[] = [];
  boosts = 0;
  timeBirth = 0;
  timeCreated = 0;
  timeLogon = 0;
  timeMaxage = 0;
  timePlayed = 0;
  deathtime = 0;
  dcount = 0;
  exp = 0;
  conditions = new Map<number, number>();
  skills = new Map<number, SkillData>();
  forgeting = 0;
  forgetcount = 0;
  fury = 0;
  genome = new Map<number, number>();
  hometown = 300;
  ingestLearned = 0;
  kaioken = 0;
  practices = 0;
  lifeperc = 0;
  limbCondition = new Map<number | string, number>();
  lastint = 0;
  moltExperience = 0;
  moltLevel = 0;
  majinize = 0;
  mimic = 0;
  olcZone = 0;
  pageLength = 0;
  phase = 0;
  poofin = "";
  poofout = "";
  position = 0;
  preference = 0;
  racialPref = 0;
  rdisplay = "";
  rewtime = 0;
  radar1 = 0;
  radar2 = 0;
  radar3 = 0;
  loadRoom = 300;
  conSdcooldown = 0;
  skillSlots = 0;
  suppression = 0;
  tailGrowth = 0;
  transclass = 0;
  transcost = new Map<number, number>();
  trainagl = 0;
  traincon = 0;
  trainint = 0;
  trainspd = 0;
  trainstr = 0;
  trainwis = 0;
  upgrade = 0;
  wimpLevel = 0;
  height = 0;
  weight = 0;
  prefFlags = new FlagHandler();
  adminFlags = new FlagHandler();
  affected: Affected[] = [];
  affectedv: Affected[] = [];
  lboard = new Map<number, number>();
  contents: ObjectInstance[] = [];
  equipment = new Map<number, ObjectInstance>();
  username = "";
  dgVariables = new Map<number, Record<string, string>>();
  senseMobiles: number[] = [];
  sensePlayers: number[] = [];
  dubPlayers = new Map<number, string>();
  aliases: AliasData[] = [];
}

export class DgScriptPrototype {
  id = -1;
  name = "";
  attachType = 0;
  triggerType = 0n;
  narg = 0;
  command = "";
  body = "";
}

export class ShopBuyData {
  itemType = -1;
  keywords = "";

  constructor(input: Partial<ShopBuyData> = {}) {
    Object.assign(this, input);
  }
}

export class Shop {
  id = -1;
  products: number[] = [];
  profitBuy = 1.0;
  profitSell = 1.0;
  typesBought: ShopBuyData[] = [];
  noSuchItem1 = "";
  noSuchItem2 = "";
  doNotBuy = "";
  missingCash1 = "";
  missingCash2 = "";
  messageBuy = "";
  messageSell = "";
  temper1 = 0;
  shopFlags = 0;
  keeper: number | null = null;
  inRoom: number[] = [];
  open1 = 0;
  open2 = 0;
  close1 = 0;
  close2 = 0;
  withWho = new FlagHandler();
  bankAccount = 0;
}

export class Guild {
  id = -1;
  skills: number[] = [];
  feats: number[] = [];
  charge = 1.0;
  noSuchSkill = "";
  notEnoughGold = "";
  minlvl = 0;
  keeper: number | null = null;
  open = 0;
  close = 0;
  withWho = new FlagHandler();
}

export class Component {
  objectPrototypeId = -1;
  consumed = true;
  inRoom = false;

  constructor(input: Partial<Component> = {}) {
    Object.assign(this, input);
  }
}

export class Assembly {
  objectPrototypeId = -1;
  assemblyType = "build";
  components: Component[] = [];
}

export class ResetCommand {
  command = "";
  ifFlag = false;
  arg1 = 0;
  arg2 = 0;
  arg3 = 0;
  arg4 = 0;
  arg5 = 0;
  sa1 = "";
  sa2 = "";

  constructor(input: Partial<ResetCommand> = {}) {
    Object.assign(this, input);
  }
}

export class Zone {
  id = -1;
  name = "";
  builders = "";
  lifespan = 30;
  age = 0;
  resetMode = 2;
  zoneFlags = new FlagHandler();
  resets: ResetCommand[] = [];
  bot = 0;
  top = 0;
  minLevel = 0;
  maxLevel = 0;
}

export class Account {
  name = "";
  email = "";
  password = "";
  slots = 3;
  rpp = 0;
  rppBank = 0;
  characters = new Set<string>();
  adminLevel = 0;
  customFile = false;
  customs: string[] = [];

  constructor(input: Partial<Account> = {}) {
    Object.assign(this, input);
    if (Array.isArray(input.characters)) {
      this.characters = new Set(input.characters);
    }
  }
}

export class HelpEntry {
  name = "";
  entry = "";
  minLevel = 0;

  constructor(input: Partial<HelpEntry> = {}) {
    Object.assign(this, input);
  }
}

function readTildeString(f: Scanner): string {
  const value = f.readUntil("~").replace(/~$/, "");
  f.readline();
  return value;
}

function copyFlagHandler(src: FlagHandler): FlagHandler {
  const out = new FlagHandler();
  out.flags = src.flags;
  out.array = [...src.array];
  return out;
}

function objectFromPrototype(proto: ObjectPrototype): ObjectInstance {
  const out = new ObjectInstance();
  out.objectPrototypeId = proto.id;
  out.itemType = proto.itemType;
  out.name = proto.name;
  out.shortDescription = proto.shortDescription;
  out.description = proto.description;
  out.actionDescription = proto.actionDescription;
  out.extraFlags = copyFlagHandler(proto.extraFlags);
  out.wearFlags = copyFlagHandler(proto.wearFlags);
  out.bitvector = copyFlagHandler(proto.bitvector);
  out.extraDescriptions = [...proto.extraDescriptions];
  out.values = new Map(proto.values);
  out.weight = proto.weight;
  out.cost = proto.cost;
  out.costPerDay = proto.costPerDay;
  out.level = proto.level;
  out.size = proto.size;
  out.affected = [...proto.affected];
  return out;
}

export function stripColor(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "@") {
      if (i + 1 < s.length && s[i + 1] === "@") {
        out += "@";
        i += 2;
      } else {
        i += 2;
      }
    } else {
      out += s[i];
      i += 1;
    }
  }
  return out;
}

export class Scanner {
  pos = 0;

  constructor(public data: string) {}

  readline(): string {
    if (this.pos >= this.data.length) {
      return "";
    }

    let nextPos = this.data.indexOf("\n", this.pos);
    if (nextPos === -1) {
      nextPos = this.data.length;
    }

    let line = this.data.slice(this.pos, nextPos);
    if (line.endsWith("\r")) {
      line = line.slice(0, -1);
    }
    this.pos = nextPos + 1;
    return line;
  }

  readUntil(delimiter: string): string {
    if (this.pos >= this.data.length) {
      return "";
    }

    let nextPos = this.data.indexOf(delimiter, this.pos);
    if (nextPos === -1) {
      nextPos = this.data.length;
    }

    const result = this.data.slice(this.pos, nextPos);
    this.pos = nextPos + delimiter.length;
    return result;
  }

  tell(): number {
    return this.pos;
  }

  seek(pos: number): void {
    this.pos = pos;
  }
}

export function parseAccount(f: Scanner): Account {
  const acc = new Account({
    name: f.readline(),
    email: f.readline().replace("<AT>", "@"),
    password: f.readline(),
    slots: parseIntStrict(f.readline()),
    rpp: parseIntStrict(f.readline()),
  });

  while (true) {
    const pos = f.tell();
    const line = f.readline();
    if (/^\d+$/.test(line)) {
      f.seek(pos);
      break;
    }
    if (line === "Empty") {
      continue;
    }
    acc.characters.add(line);
  }

  acc.adminLevel = parseIntStrict(f.readline());
  acc.customFile = Boolean(parseIntStrict(f.readline()));
  acc.rppBank = parseIntStrict(f.readline());
  return acc;
}

function splitInts(line: string): number[] {
  return line.trim().split(/\s+/).filter(Boolean).map(parseIntStrict);
}

function getDgContext(
  character: Character,
  context: number,
): Record<string, string> {
  let values = character.dgVariables.get(context);
  if (!values) {
    values = {};
    character.dgVariables.set(context, values);
  }
  return values;
}

export function parseCharacter(f: Scanner): Character {
  const out = new Character();

  function parseAffects(): Affected[] {
    const affects: Affected[] = [];
    while (true) {
      const a = f.readline();
      if (!a) break;
      const values = splitInts(a);
      if (values[0] === 0) return affects;
      affects.push(
        new Affected({
          type: values[0],
          duration: values[1],
          modifier: values[2],
          location: values[3],
          bitvector: values[4],
          specific: values[5],
        }),
      );
    }
    return affects;
  }

  function parseSkills(): void {
    while (true) {
      const s = f.readline();
      if (!s) break;
      const values = splitInts(s);
      if (values[0] === 0) return;
      out.skills.set(
        values[0],
        new SkillData({ level: values[1], perfs: values[2] }),
      );
    }
  }

  function parseSkillBonus(): void {
    while (true) {
      const s = f.readline();
      if (!s) break;
      const values = splitInts(s);
      if (values[0] === 0) return;
    }
  }

  while (true) {
    const line = f.readline();
    if (!line) break;

    let key: string;
    let value: string;
    if (line.includes(":")) {
      const parts = line.split(/:(.*)/s, 2);
      key = parts[0].trim();
      value = (parts[1] ?? "").trim();
    } else {
      key = line.trim();
      value = "";
    }

    switch (key) {
      case "Ac":
        out.armor = parseIntStrict(value);
        break;
      case "Act":
        out.act.loadFlags(value.split(/\s+/));
        break;
      case "Aff":
        out.affectedBy.loadFlags(value.split(/\s+/));
        break;
      case "Affs":
        out.affected = parseAffects();
        break;
      case "Affv":
        out.affectedv = parseAffects();
        break;
      case "AdmL":
        out.adminLevel = parseIntStrict(value);
        break;
      case "Abso":
        out.absorbs = parseIntStrict(value);
        break;
      case "AdmF":
        out.adminFlags.loadFlags(value.split(/\s+/));
        break;
      case "Alin":
        out.alignment = parseIntStrict(value);
        break;
      case "Aura":
        out.aura = parseIntStrict(value);
        break;
      case "Bank":
        out.bankGold = parseIntStrict(value);
        break;
      case "Bki":
        out.baseki = parseIntStrict(value);
        break;
      case "Blss":
        out.blesslvl = parseIntStrict(value);
        break;
      case "Boam":
        out.lboard.set(0, parseIntStrict(value));
        break;
      case "Boai":
        out.lboard.set(1, parseIntStrict(value));
        break;
      case "Boac":
        out.lboard.set(2, parseIntStrict(value));
        break;
      case "Boad":
        out.lboard.set(3, parseIntStrict(value));
        break;
      case "Boab":
        out.lboard.set(4, parseIntStrict(value));
        break;
      case "Bonu": {
        const bonuses = splitInts(f.readline().trim());
        for (const [i, bonus] of bonuses.entries()) {
          if (bonus !== 0) out.bonuses.push(i);
        }
        break;
      }
      case "Boos":
        out.boosts = parseIntStrict(value);
        break;
      case "Bpl":
        out.basepl = parseIntStrict(value);
        break;
      case "Brth":
        out.timeBirth = parseIntStrict(value);
        break;
      case "Bst":
        out.basest = parseIntStrict(value);
        break;
      case "Cha":
        out.cha = parseIntStrict(value);
        break;
      case "Clas":
        out.chclass = parseIntStrict(value);
        break;
      case "Con":
        out.con = parseIntStrict(value);
        break;
      case "Crtd":
        out.timeCreated = parseIntStrict(value);
        break;
      case "Desc":
        out.description = f.readUntil("~").replace(/~$/, "");
        f.readline();
        break;
      case "Deat":
        out.deathtime = parseIntStrict(value);
        break;
      case "Deac":
        out.dcount = parseIntStrict(value);
        break;
      case "Dex":
        out.dex = parseIntStrict(value);
        break;
      case "Drnk":
        out.conditions.set(0, parseIntStrict(value));
        break;
      case "Exp":
        out.exp = parseIntStrict(value);
        break;
      case "Eye":
        out.eye = parseIntStrict(value);
        break;
      case "Forc":
        out.forgetcount = parseIntStrict(value);
        break;
      case "Forg":
        out.forgeting = parseIntStrict(value);
        break;
      case "Fury":
        out.fury = parseIntStrict(value);
        break;
      case "Gold":
        out.gold = parseIntStrict(value);
        break;
      case "Geno":
        out.genome.set(0, parseIntStrict(value));
        break;
      case "Gen1":
        out.genome.set(1, parseIntStrict(value));
        break;
      case "Hite":
        out.height = parseIntStrict(value);
        break;
      case "Home":
        out.hometown = parseIntStrict(value);
        break;
      case "Hrc":
        out.hairc = parseIntStrict(value);
        break;
      case "Hrl":
        out.hairl = parseIntStrict(value);
        break;
      case "Hrs":
        out.hairs = parseIntStrict(value);
        break;
      case "Hung":
        out.conditions.set(1, parseIntStrict(value));
        break;
      case "Id":
        out.id = parseIntStrict(value);
        break;
      case "INGl":
        out.ingestLearned = parseIntStrict(value);
        break;
      case "Int":
        out.intel = parseIntStrict(value);
        break;
      case "Kaio":
        out.kaioken = parseIntStrict(value);
        break;
      case "Last":
        out.timeLogon = parseIntStrict(value);
        break;
      case "Lern":
        out.practices = parseIntStrict(value);
        break;
      case "Levl":
        out.level = parseIntStrict(value);
        break;
      case "Lila":
        out.limbCondition.set(1, parseIntStrict(value));
        break;
      case "Lill":
        out.limbCondition.set(3, parseIntStrict(value));
        break;
      case "Lira":
        out.limbCondition.set(0, parseIntStrict(value));
        break;
      case "Lirl":
        out.limbCondition.set(2, parseIntStrict(value));
        break;
      case "Lint":
        out.lastint = parseIntStrict(value);
        break;
      case "Mexp":
        out.moltExperience = parseIntStrict(value);
        break;
      case "Mlvl":
        out.moltLevel = parseIntStrict(value);
        break;
      case "Maji":
        out.majinize = parseIntStrict(value);
        break;
      case "Mimi":
        out.mimic = parseIntStrict(value);
        break;
      case "MxAg":
        out.timeMaxage = parseIntStrict(value);
        break;
      case "Name":
        out.name = value;
        break;
      case "Olc":
        out.olcZone = parseIntStrict(value);
        break;
      case "Page":
        out.pageLength = parseIntStrict(value);
        break;
      case "Phas":
        out.phase = parseIntStrict(value);
        break;
      case "Plyd":
        out.timePlayed = parseIntStrict(value);
        break;
      case "PfIn":
        out.poofin = value;
        break;
      case "PfOt":
        out.poofout = value;
        break;
      case "Posi":
        out.position = parseIntStrict(value);
        break;
      case "Pref":
        out.prefFlags.loadFlags(value.split(/\s+/));
        break;
      case "Prff":
        out.preference = parseIntStrict(value);
        break;
      case "Race":
        out.race = parseIntStrict(value);
        break;
      case "Raci":
        out.racialPref = parseIntStrict(value);
        break;
      case "rDis":
        out.rdisplay = value;
        break;
      case "Rtim":
        out.rewtime = parseIntStrict(value);
        break;
      case "Rad1":
        out.radar1 = parseIntStrict(value);
        break;
      case "Rad2":
        out.radar2 = parseIntStrict(value);
        break;
      case "Rad3":
        out.radar3 = parseIntStrict(value);
        break;
      case "Room":
        out.loadRoom = parseIntStrict(value);
        break;
      case "RPfe":
        out.feature = value;
        break;
      case "Sex":
        out.sex = parseIntStrict(value);
        break;
      case "Skil":
        parseSkills();
        break;
      case "Size":
        out.size = parseIntStrict(value);
        break;
      case "SklB":
        parseSkillBonus();
        break;
      case "SkCl":
        out.practices += parseIntStrict(value.split(/\s+/)[1]);
        break;
      case "Slot":
        out.skillSlots = parseIntStrict(value);
        break;
      case "Str":
        out.strength = parseIntStrict(value);
        break;
      case "Supp":
        out.suppression = parseIntStrict(value);
        break;
      case "Tgro":
        out.tailGrowth = parseIntStrict(value);
        break;
      case "Tcla":
        out.transclass = parseIntStrict(value);
        break;
      case "Tcos": {
        const values = splitInts(value);
        out.transcost.set(values[0], values[1]);
        break;
      }
      case "Thir":
        out.conditions.set(2, parseIntStrict(value));
        break;
      case "Trag":
        out.trainagl = parseIntStrict(value);
        break;
      case "Trco":
        out.traincon = parseIntStrict(value);
        break;
      case "Trin":
        out.trainint = parseIntStrict(value);
        break;
      case "Trsp":
        out.trainspd = parseIntStrict(value);
        break;
      case "Trst":
        out.trainstr = parseIntStrict(value);
        break;
      case "Trwi":
        out.trainwis = parseIntStrict(value);
        break;
      case "Voic":
        out.voice = value;
        break;
      case "Wate":
        out.weight = parseIntStrict(value);
        break;
      case "Wimp":
        out.wimpLevel = parseIntStrict(value);
        break;
      case "Wis":
        out.wis = parseIntStrict(value);
        break;
    }
  }

  return out;
}

export function* parseObjects(f: Scanner): Generator<ObjectPrototype> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new ObjectPrototype();
    out.id = parseIntStrict(line.slice(1));
    out.name = f.readUntil("~");
    f.readline();
    out.shortDescription = f.readUntil("~");
    f.readline();
    out.description = f.readUntil("~");
    f.readline();
    out.actionDescription = f.readUntil("~");
    f.readline();

    const symbols = f.readline().split(/\s+/);
    out.itemType = parseIntStrict(symbols[0]);
    out.extraFlags.loadFlags(symbols.slice(1, 5));
    out.wearFlags.loadFlags(symbols.slice(5, 9));
    out.bitvector.loadFlags(symbols.slice(9, 13));

    for (const [i, value] of splitInts(f.readline()).entries()) {
      if (value) out.values.set(i, value);
    }

    const [weight, cost, costPerDay, level] = splitInts(f.readline());
    out.weight = weight;
    out.cost = cost;
    out.costPerDay = costPerDay;
    out.level = level;

    while (true) {
      const pos = f.tell();
      const section = f.readline();
      if (!section) break;
      if (section.startsWith("#")) {
        f.seek(pos);
        break;
      }
      if (section.startsWith("$~")) {
        yield out;
        return;
      }
      if (section.startsWith("Z")) {
        out.size = parseIntStrict(f.readline());
      } else if (section.startsWith("T")) {
        out.protoScript.push(parseIntStrict(section.split(" ", 2)[1]));
      } else if (section.startsWith("S")) {
        f.readline();
      } else if (section.startsWith("E")) {
        const keyword = f.readUntil("~");
        f.readline();
        const description = f.readUntil("~");
        f.readline();
        out.extraDescriptions.push(new ExtraDescription(keyword, description));
      } else if (section.startsWith("A")) {
        const values = splitInts(f.readline());
        out.affected.push(
          new ObjAffected({
            location: values[0],
            modifier: values[1],
            specific: values[2],
          }),
        );
      }
    }
    yield out;
  }
}

export function* parseSavedObject(
  f: Scanner,
  oproto: Map<number, ObjectPrototype> | null = null,
): Generator<[number, ObjectInstance]> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~")) return;
    if (!line.startsWith("#")) continue;

    const prototypeId = parseIntStrict(line.slice(1));
    const out = prototypeId >= 0 && oproto?.has(prototypeId)
      ? objectFromPrototype(oproto.get(prototypeId)!)
      : new ObjectInstance();
    out.objectPrototypeId = prototypeId;

    const symbols = f.readline().split(/\s+/);
    if (symbols.length < 21) continue;
    const location = parseIntStrict(symbols[0]);
    const itemValues = symbols.slice(1, 9).concat(symbols.slice(13, 21)).map(
      parseIntStrict,
    );
    out.extraFlags.loadFlags(symbols.slice(9, 13));
    for (const [i, val] of itemValues.entries()) {
      if (val) out.values.set(i, val);
    }

    const markerPos = f.tell();
    const marker = f.readline();
    if (marker === "XAP") {
      out.name = readTildeString(f);
      out.shortDescription = readTildeString(f);
      out.actionDescription = readTildeString(f);
      out.description = readTildeString(f);

      const xapNumeric = f.readline().split(/\s+/);
      if (xapNumeric.length >= 8) {
        out.itemType = parseIntStrict(xapNumeric[0]);
        out.wearFlags.loadFlags(xapNumeric.slice(1, 5));
        out.weight = parseIntStrict(xapNumeric[5]);
        out.cost = parseIntStrict(xapNumeric[6]);
        out.costPerDay = parseIntStrict(xapNumeric[7]);
      }

      while (true) {
        const sectionPos = f.tell();
        const section = f.readline();
        if (!section) break;
        if (section.startsWith("#") || section.startsWith("$")) {
          f.seek(sectionPos);
          break;
        }
        if (section.startsWith("E")) {
          out.extraDescriptions.push(
            new ExtraDescription(readTildeString(f), readTildeString(f)),
          );
        } else if (section.startsWith("A")) {
          const data = splitInts(f.readline());
          if (data.length >= 3) {
            out.affected.push(
              new ObjAffected({
                location: data[0],
                modifier: data[1],
                specific: data[2],
              }),
            );
          }
        } else if (section.startsWith("Z")) {
          const data = f.readline().trim();
          if (data) out.size = parseIntStrict(data);
        } else if (section.startsWith("G")) {
          const data = f.readline().trim();
          if (data) out.createdAt = parseIntStrict(data);
        } else if (section.startsWith("U")) {
          const data = f.readline().trim();
          if (data) out.id = parseIntStrict(data);
        } else if (section.startsWith("S")) {
          f.readline();
        } else {
          break;
        }
      }
    } else {
      f.seek(markerPos);
    }

    yield [location, out];
  }
}

export function* parseMobiles(f: Scanner): Generator<CharacterPrototype> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new CharacterPrototype();
    out.id = parseIntStrict(line.slice(1));
    out.name = f.readUntil("~");
    f.readline();
    out.shortDescr = f.readUntil("~");
    f.readline();
    out.longDescr = f.readUntil("~");
    f.readline();
    out.description = f.readUntil("~");
    f.readline();
    const symbols = f.readline().split(/\s+/);
    out.act.loadFlags(symbols.slice(0, 4));
    out.affectedBy.loadFlags(symbols.slice(4, 8));
    out.alignment = parseIntStrict(symbols[8]);
    const letter = symbols[9];

    const parseSimple = (): void => {
      let data = f.readline().replaceAll("+", " ").replaceAll("d", " ").split(
        /\s+/,
      );
      out.level = parseIntStrict(data[0]);
      out.basepl = parseIntStrict(data[3]);
      out.baseki = parseIntStrict(data[4]);
      out.basest = parseIntStrict(data[5]);
      out.damageMod = parseIntStrict(data[8]);
      data = f.readline().split(/\s+/);
      out.gold = parseIntStrict(data[0]);
      out.race = parseIntStrict(data[2]);
      out.chclass = parseIntStrict(data[3]);
      data = f.readline().split(/\s+/);
      out.defaultPosition = parseIntStrict(data[1]);
      out.sex = parseIntStrict(data[2]);
    };

    const parseEspec = (line: string): void => {
      const [rawType, rawData] = line.toLowerCase().split(/:(.*)/s, 2);
      const type = rawType.trim();
      const data = (rawData ?? "").trim();
      switch (type) {
        case "size":
          out.size = parseIntStrict(data);
          break;
        case "str":
          out.strength = parseIntStrict(data);
          break;
        case "int":
          out.intel = parseIntStrict(data);
          break;
        case "wis":
          out.wis = parseIntStrict(data);
          break;
        case "dex":
          out.dex = parseIntStrict(data);
          break;
        case "con":
          out.con = parseIntStrict(data);
          break;
        case "cha":
          out.cha = parseIntStrict(data);
          break;
      }
    };

    if (letter === "S") parseSimple();
    if (letter === "E") {
      parseSimple();
      while (true) {
        const pos = f.tell();
        const enhancedLine = f.readline();
        if (!enhancedLine) break;
        if (enhancedLine.startsWith("#")) {
          f.seek(pos);
          break;
        }
        if (enhancedLine.startsWith("E")) break;
        parseEspec(enhancedLine);
      }
    }

    while (true) {
      const pos = f.tell();
      const next = f.readline();
      if (!next) break;
      if (next.startsWith("#")) {
        f.seek(pos);
        break;
      }
      if (next.startsWith("$~")) {
        yield out;
        return;
      }
      if (next.startsWith("T")) {
        out.protoScript.push(parseIntStrict(next.split(" ", 2)[1]));
      }
    }
    yield out;
  }
}

export function* parseRooms(f: Scanner): Generator<Room> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new Room();
    out.id = parseIntStrict(line.slice(1));
    out.name = f.readUntil("~");
    f.readline();
    out.description = f.readUntil("~");
    f.readline();
    const symbols = f.readline().split(/\s+/);
    out.roomFlags.loadFlags(symbols.slice(0, 4));
    out.sectorType = parseIntStrict(symbols[5]);

    const setupDir = (dirLine: string): [number, Exit] => {
      const ex = new Exit();
      const direction = parseIntStrict(dirLine.slice(1));
      ex.keywords = f.readUntil("~");
      f.readline();
      ex.description = f.readUntil("~");
      f.readline();
      const data = splitInts(f.readline());
      ex.exitInfo = data[0];
      ex.key = data[1];
      ex.toRoom = data[2];
      ex.dclock = data[3];
      ex.dchide = data[4];
      return [direction, ex];
    };

    while (true) {
      const pos = f.tell();
      const next = f.readline();
      if (!next) break;
      if (next.startsWith("#")) {
        f.seek(pos);
        break;
      }
      if (next.startsWith("$~")) {
        yield out;
        return;
      }
      if (next.startsWith("S")) continue;
      if (next.startsWith("T")) {
        out.protoScript.push(parseIntStrict(next.split(" ", 2)[1]));
      }
      if (next.startsWith("E")) {
        const keyword = f.readUntil("~");
        f.readline();
        const description = f.readUntil("~");
        f.readline();
        out.extraDescriptions.push(new ExtraDescription(keyword, description));
      }
      if (next.startsWith("D")) {
        const [direction, ex] = setupDir(next);
        out.exits.set(direction, ex);
      }
    }
    yield out;
  }
}

export function* parseScripts(f: Scanner): Generator<DgScriptPrototype> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new DgScriptPrototype();
    out.id = parseIntStrict(line.slice(1));
    out.name = f.readUntil("~");
    f.readline();
    const symbols = f.readline().split(/\s+/);
    out.attachType = parseIntStrict(symbols[0]);
    out.triggerType = asciiFlagConv(symbols[1]);
    out.narg = parseIntStrict(symbols[2]);
    out.command = f.readUntil("~");
    f.readline();
    out.body = f.readUntil("~");
    f.readline();
    yield out;
  }
}

const RE_BUYTYPE = /^(\d+)(.*)$/;

export function* parseShops(f: Scanner): Generator<Shop> {
  f.readline();
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new Shop();
    out.id = parseIntStrict(line.slice(1).replace(/~$/, ""));
    while (true) {
      const product = parseIntStrict(f.readline());
      if (product === -1) break;
      if (!out.products.includes(product)) out.products.push(product);
    }
    out.profitBuy = Number.parseFloat(f.readline());
    out.profitSell = Number.parseFloat(f.readline());
    while (true) {
      const data = f.readline();
      if (data === "-1") break;
      const match = RE_BUYTYPE.exec(data);
      if (!match) continue;
      out.typesBought.push(
        new ShopBuyData({
          itemType: parseIntStrict(match[1]),
          keywords: match[2].trim(),
        }),
      );
    }
    const messages = [
      "noSuchItem1",
      "noSuchItem2",
      "doNotBuy",
      "missingCash1",
      "missingCash2",
      "messageBuy",
      "messageSell",
    ] as const;
    for (const msg of messages) {
      out[msg] = f.readUntil("~");
      f.readline();
    }
    out.temper1 = parseIntStrict(f.readline());
    out.shopFlags = parseIntStrict(f.readline());
    const keeper = parseIntStrict(f.readline());
    out.keeper = keeper === -1 ? null : keeper;
    out.withWho.loadFlags(f.readline().split(/\s+/));
    while (true) {
      const data = parseIntStrict(f.readline());
      if (data === -1) break;
      out.inRoom.push(data);
    }
    out.open1 = parseIntStrict(f.readline());
    out.close1 = parseIntStrict(f.readline());
    out.open2 = parseIntStrict(f.readline());
    out.close2 = parseIntStrict(f.readline());
    yield out;
  }
}

export function* parseGuilds(f: Scanner): Generator<Guild> {
  while (true) {
    const line = f.readline();
    if (!line || line.startsWith("$~") || !line.startsWith("#")) break;
    const out = new Guild();
    out.id = parseIntStrict(line.slice(1).replace(/~$/, ""));
    const skills = new Set<number>();
    const feats = new Set<number>();
    while (true) {
      const data = f.readline();
      if (data === "-1") break;
      const parts = splitInts(data);
      const skillId = parts[0];
      const typeId = parts[1] ?? 1;
      (typeId === 1 ? skills : feats).add(skillId);
    }
    out.skills.push(...skills);
    out.feats.push(...feats);
    out.charge = Number.parseFloat(f.readline());
    out.noSuchSkill = f.readUntil("~");
    f.readline();
    out.notEnoughGold = f.readUntil("~");
    f.readline();
    out.minlvl = parseIntStrict(f.readline());
    const keeper = parseIntStrict(f.readline());
    out.keeper = keeper === -1 ? null : keeper;
    const withWho = [f.readline()];
    out.open = parseIntStrict(f.readline());
    out.close = parseIntStrict(f.readline());
    withWho.push(...f.readline().split(/\s+/));
    out.withWho.loadFlags(withWho);
    yield out;
  }
}

export function* parseAssemblies(f: Scanner): Generator<Assembly> {
  let numNewlines = 0;
  while (true) {
    const line = f.readline();
    if (!line) {
      numNewlines += 1;
      if (numNewlines >= 1) break;
      continue;
    }
    if (!line.startsWith("Vnum")) continue;
    numNewlines = 0;
    const out = new Assembly();
    const data = line.split(/\s+/);
    out.objectPrototypeId = parseIntStrict(data[1].slice(1));
    out.assemblyType = data[2];
    while (true) {
      const componentLine = f.readline();
      if (!componentLine) {
        numNewlines += 1;
        break;
      }
      if (!componentLine.startsWith("Component")) continue;
      const componentData = componentLine.split(/\s+/);
      out.components.push(
        new Component({
          objectPrototypeId: parseIntStrict(componentData[1].slice(1)),
          consumed: Boolean(parseIntStrict(componentData[2])),
          inRoom: Boolean(parseIntStrict(componentData[3])),
        }),
      );
    }
    yield out;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

async function* walkFiles(path: string): AsyncGenerator<string> {
  if (!await exists(path)) return;
  for await (const entry of Deno.readDir(path)) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory) yield* walkFiles(child);
    else if (entry.isFile) yield child;
  }
}

async function* globFiles(
  path: string,
  suffix: string,
  recursive = false,
): AsyncGenerator<string> {
  if (recursive) {
    for await (const file of walkFiles(path)) {
      if (file.toLowerCase().endsWith(suffix)) yield file;
    }
    return;
  }
  if (!await exists(path)) return;
  for await (const entry of Deno.readDir(path)) {
    if (entry.isFile && entry.name.toLowerCase().endsWith(suffix)) {
      yield `${path}/${entry.name}`;
    }
  }
}

async function readText(path: string): Promise<string> {
  return await Deno.readTextFile(path);
}

function stem(path: string): string {
  const name = path.split("/").at(-1) ?? path;
  return name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
}

export class LegacyDatabase {
  zones = new Map<number, Zone>();
  oproto = new Map<number, ObjectPrototype>();
  nproto = new Map<number, CharacterPrototype>();
  dgproto = new Map<number, DgScriptPrototype>();
  rooms = new Map<number, Room>();
  shops = new Map<number, Shop>();
  guilds = new Map<number, Guild>();
  help: HelpEntry[] = [];
  assemblies: Assembly[] = [];
  objects = new Map<number, ObjectInstance>();
  houseObjects = new Map<number, [number, ObjectInstance][]>();
  playerObjects = new Map<number, [number, ObjectInstance][]>();
  accounts = new Map<string, Account>();
  characters = new Map<number, Character>();
  charactersToAccount = new Map<string, string>();
  playerDgvarsRaw = new Map<number, string>();
  playerAliasesRaw = new Map<number, string>();
  playerSenseRaw = new Map<number, string>();
  playerIntroRaw = new Map<number, string>();
  private nextObjectId = 1;

  zoneIdFor(thingId: number): number {
    for (const [zoneId, zone] of this.zones) {
      if (zone.bot <= thingId && thingId <= zone.top) return zoneId;
    }
    return -1;
  }

  checkAffects(): void {
    for (const char of this.nproto.values()) {
      const counter = char.affected.filter((affect) => affect.valid()).length;
      if (counter) {
        console.log(`Character ${char.name} has ${counter} valid affects.`);
      }
    }
  }

  private async loadAccounts(dataDir: string): Promise<void> {
    const accountDir = `${dataDir}/user`;
    for await (const usrFile of globFiles(accountDir, ".usr", true)) {
      const acc = parseAccount(new Scanner(await readText(usrFile)));
      for (const character of acc.characters) {
        this.charactersToAccount.set(character, acc.name);
      }
      this.accounts.set(acc.name.toLowerCase(), acc);
    }

    for await (const cusFile of globFiles(accountDir, ".cus", true)) {
      const acc = this.accounts.get(stem(cusFile));
      if (!acc) continue;
      const scanner = new Scanner(await readText(cusFile));
      scanner.readline();
      const customs: string[] = [];
      while (true) {
        const line = scanner.readline();
        if (!line) break;
        customs.push(line);
      }
      acc.customs = customs;
    }
  }

  private async loadHelp(dataDir: string): Promise<void> {
    const hfile = `${dataDir}/text/help/help.hlp`;
    if (!await exists(hfile)) return;
    let current: HelpEntry | null = null;
    for (const line of (await readText(hfile)).split(/\r?\n/)) {
      const stripped = line.trimEnd();
      if (stripped.startsWith("#")) {
        if (current) this.help.push(current);
        current = new HelpEntry({
          minLevel: stripped.length > 1 ? parseIntStrict(stripped.slice(1)) : 0,
        });
      } else if (current) {
        if (!current.name) current.name = stripped;
        else current.entry += `${stripped}\n`;
      }
    }
    if (current) this.help.push(current);
  }

  private async loadZones(dataDir: string): Promise<void> {
    for await (const zonFile of globFiles(`${dataDir}/world/zon`, ".zon")) {
      const lines = (await readText(zonFile)).split(/\r?\n/);
      if (lines.length < 5 || !lines[1].trimEnd().startsWith("#")) continue;
      const zoneId = parseIntStrict(lines[1].trimEnd().slice(1));
      const stats = lines[4].trimEnd().split(/\s+/);
      const zone = new Zone();
      zone.id = zoneId;
      zone.builders = lines[2].trimEnd().replace(/~$/, "");
      zone.name = lines[3].trimEnd().replace(/~$/, "");
      zone.bot = parseIntStrict(stats[0]);
      zone.top = parseIntStrict(stats[1]);
      zone.lifespan = parseIntStrict(stats[2]);
      zone.resetMode = parseIntStrict(stats[3]);
      zone.zoneFlags = FlagHandler.fromFlagsList(stats.slice(4, 8));
      zone.minLevel = parseIntStrict(stats[8]);
      zone.maxLevel = parseIntStrict(stats[9]);
      for (const rawLine of lines.slice(5)) {
        const line = rawLine.trimEnd();
        if (line === "S") break;
        const tokens = line.split(/\s+/);
        if (tokens.length < 7) continue;
        zone.resets.push(
          new ResetCommand({
            command: tokens[0],
            ifFlag: Boolean(parseIntStrict(tokens[1])),
            arg1: parseIntStrict(tokens[2]),
            arg2: parseIntStrict(tokens[3]),
            arg3: parseIntStrict(tokens[4]),
            arg4: parseIntStrict(tokens[5]),
            arg5: parseIntStrict(tokens[6]),
          }),
        );
      }
      this.zones.set(zoneId, zone);
    }
  }

  private async loadOproto(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/obj`, ".obj")) {
      for (const obj of parseObjects(new Scanner(await readText(file)))) {
        this.oproto.set(obj.id, obj);
      }
    }
  }

  private async loadNproto(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/mob`, ".mob")) {
      for (const npc of parseMobiles(new Scanner(await readText(file)))) {
        this.nproto.set(npc.id, npc);
      }
    }
  }

  private async loadRooms(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/wld`, ".wld")) {
      const zoneId = parseIntStrict(stem(file));
      for (const room of parseRooms(new Scanner(await readText(file)))) {
        room.zone = zoneId;
        this.rooms.set(room.id, room);
      }
    }
  }

  private async loadDgproto(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/trg`, ".trg")) {
      for (const script of parseScripts(new Scanner(await readText(file)))) {
        this.dgproto.set(script.id, script);
      }
    }
  }

  private async loadShops(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/shp`, ".shp")) {
      for (const shop of parseShops(new Scanner(await readText(file)))) {
        this.shops.set(shop.id, shop);
      }
    }
  }

  private async loadGuilds(dataDir: string): Promise<void> {
    for await (const file of globFiles(`${dataDir}/world/gld`, ".gld")) {
      for (const guild of parseGuilds(new Scanner(await readText(file)))) {
        this.guilds.set(guild.id, guild);
      }
    }
  }

  private async loadAssemblies(dataDir: string): Promise<void> {
    const file = `${dataDir}/etc/assemblies`;
    if (!await exists(file)) return;
    for (const assembly of parseAssemblies(new Scanner(await readText(file)))) {
      this.assemblies.push(assembly);
    }
  }

  private indexObject(obj: ObjectInstance): void {
    if (obj.id > 0) {
      if (Number.isSafeInteger(obj.id) && obj.id >= this.nextObjectId) {
        this.nextObjectId = obj.id + 1;
      }
    } else {
      while (this.objects.has(this.nextObjectId)) this.nextObjectId += 1;
      obj.id = this.nextObjectId;
      this.nextObjectId += 1;
    }
    this.objects.set(obj.id, obj);
  }

  private detachObject(obj: ObjectInstance): void {
    if (obj.inObj) {
      obj.inObj.contains = obj.inObj.contains.filter((child) => child !== obj);
      obj.inObj = null;
    }
    if (obj.carriedBy) {
      obj.carriedBy.contents = obj.carriedBy.contents.filter((child) =>
        child !== obj
      );
      obj.carriedBy = null;
    }
    if (obj.inRoom) {
      obj.inRoom.contents = obj.inRoom.contents.filter((child) =>
        child !== obj
      );
      obj.inRoom = null;
    }
    if (obj.wornBy) {
      for (const [slot, equipped] of obj.wornBy.equipment.entries()) {
        if (equipped === obj) obj.wornBy.equipment.delete(slot);
      }
      obj.wornBy = null;
      obj.wornOn = 0;
    }
  }

  private placeObjectInRoom(obj: ObjectInstance, room: Room): void {
    this.detachObject(obj);
    obj.inRoom = room;
    room.contents.push(obj);
  }

  private placeObjectInInventory(
    obj: ObjectInstance,
    character: Character,
  ): void {
    this.detachObject(obj);
    obj.carriedBy = character;
    character.contents.push(obj);
  }

  private placeObjectInEquipment(
    obj: ObjectInstance,
    character: Character,
    slot: number,
  ): void {
    this.detachObject(obj);
    obj.wornBy = character;
    obj.wornOn = slot;
    character.equipment.set(slot, obj);
  }

  private placeObjectInContainer(
    obj: ObjectInstance,
    container: ObjectInstance,
  ): void {
    this.detachObject(obj);
    obj.inObj = container;
    container.contains.push(obj);
  }

  private rebuildHouseObjectGraph(
    room: Room,
    entries: [number, ObjectInstance][],
  ): void {
    const contRow: ObjectInstance[][] = Array.from(
      { length: MAX_BAG_ROWS },
      () => [],
    );
    for (const [locate, obj] of entries) {
      this.indexObject(obj);
      this.placeObjectInRoom(obj, room);
      for (let row = MAX_BAG_ROWS - 1; row > -locate; row -= 1) {
        for (const orphan of contRow[row]) this.placeObjectInRoom(orphan, room);
        contRow[row] = [];
      }
      const rowIndex = -locate;
      if (
        0 <= rowIndex && rowIndex < MAX_BAG_ROWS && contRow[rowIndex].length
      ) {
        for (const child of contRow[rowIndex]) {
          if (obj.itemType === ITEM_CONTAINER) {
            this.placeObjectInContainer(child, obj);
          } else this.placeObjectInRoom(child, room);
        }
        contRow[rowIndex] = [];
      }
      if (-MAX_BAG_ROWS <= locate && locate < 0) {
        this.detachObject(obj);
        contRow[-locate - 1].push(obj);
      }
    }
    for (let row = MAX_BAG_ROWS - 1; row >= 0; row -= 1) {
      for (const orphan of contRow[row]) this.placeObjectInRoom(orphan, room);
    }
  }

  private rebuildPlayerObjectGraph(
    character: Character,
    entries: [number, ObjectInstance][],
  ): void {
    const contRow: ObjectInstance[][] = Array.from(
      { length: MAX_BAG_ROWS },
      () => [],
    );
    for (const [locate, obj] of entries) {
      this.indexObject(obj);
      obj.owner = character;
      if (locate > 0) {
        this.placeObjectInEquipment(obj, character, locate - 1);
        for (let row = MAX_BAG_ROWS - 1; row > 0; row -= 1) {
          for (const orphan of contRow[row]) {
            this.placeObjectInInventory(orphan, character);
          }
          contRow[row] = [];
        }
        for (const child of contRow[0]) {
          if (obj.itemType === ITEM_CONTAINER) {
            this.placeObjectInContainer(child, obj);
          } else this.placeObjectInInventory(child, character);
        }
        contRow[0] = [];
      } else {
        this.placeObjectInInventory(obj, character);
        for (let row = MAX_BAG_ROWS - 1; row > -locate; row -= 1) {
          for (const orphan of contRow[row]) {
            this.placeObjectInInventory(orphan, character);
          }
          contRow[row] = [];
        }
        const rowIndex = -locate;
        if (
          0 <= rowIndex && rowIndex < MAX_BAG_ROWS && contRow[rowIndex].length
        ) {
          for (const child of contRow[rowIndex]) {
            if (obj.itemType === ITEM_CONTAINER) {
              this.placeObjectInContainer(child, obj);
            } else this.placeObjectInInventory(child, character);
          }
          contRow[rowIndex] = [];
        }
        if (-MAX_BAG_ROWS <= locate && locate < 0) {
          this.detachObject(obj);
          contRow[-locate - 1].push(obj);
        }
      }
    }
    for (let row = MAX_BAG_ROWS - 1; row >= 0; row -= 1) {
      for (const orphan of contRow[row]) {
        this.placeObjectInInventory(orphan, character);
      }
    }
  }

  private async loadHouses(dataDir: string): Promise<void> {
    for await (const houseFile of globFiles(`${dataDir}/house`, ".house")) {
      const roomId = parseIntStrict(stem(houseFile));
      const room = this.rooms.get(roomId);
      if (!room) continue;
      const entries = [
        ...parseSavedObject(
          new Scanner(await readText(houseFile)),
          this.oproto,
        ),
      ];
      if (entries.length) {
        this.houseObjects.set(roomId, entries);
        this.rebuildHouseObjectGraph(room, entries);
      }
    }
  }

  private async loadPlrobjs(dataDir: string): Promise<void> {
    const byName = new Map(
      [...this.characters.values()].map((c) => [c.name.toLowerCase(), c]),
    );
    for await (const objFile of walkFiles(`${dataDir}/plrobjs`)) {
      if (objFile.toLowerCase().endsWith(".copy")) continue;
      const character = byName.get(stem(objFile).toLowerCase());
      if (!character) continue;
      const entries = [
        ...parseSavedObject(new Scanner(await readText(objFile)), this.oproto),
      ];
      if (entries.length) {
        this.playerObjects.set(character.id, entries);
        this.rebuildPlayerObjectGraph(character, entries);
      }
    }
  }

  private async loadPlrvars(dataDir: string): Promise<void> {
    const byName = new Map(
      [...this.characters.values()].map((c) => [c.name.toLowerCase(), c]),
    );
    for await (const varFile of walkFiles(`${dataDir}/plrvars`)) {
      const character = byName.get(stem(varFile).toLowerCase());
      if (!character) continue;
      const raw = await readText(varFile);
      this.playerDgvarsRaw.set(character.id, raw);
      for (const line of raw.split(/\r?\n/)) {
        if (!line) continue;
        const parts = line.split(/\s+/, 3);
        if (parts.length < 2) continue;
        const context = parseIntStrict(parts[1]);
        getDgContext(character, context)[parts[0]] = parts[2] ?? "";
      }
    }
  }

  private async loadPlralias(dataDir: string): Promise<void> {
    const byName = new Map(
      [...this.characters.values()].map((c) => [c.name.toLowerCase(), c]),
    );
    for await (const aliasFile of walkFiles(`${dataDir}/plralias`)) {
      const character = byName.get(stem(aliasFile).toLowerCase());
      if (!character) continue;
      const raw = await readText(aliasFile);
      this.playerAliasesRaw.set(character.id, raw);
      const lines = raw.split(/\r?\n/);
      for (let i = 0; i + 4 < lines.length; i += 5) {
        if (
          Number.isNaN(parseIntStrict(lines[i])) ||
          Number.isNaN(parseIntStrict(lines[i + 2]))
        ) continue;
        character.aliases.push(
          new AliasData({
            alias: lines[i + 1],
            replacement: lines[i + 3],
            type: parseIntStrict(lines[i + 4]),
          }),
        );
      }
    }
  }

  private async loadSense(dataDir: string): Promise<void> {
    const byName = new Map(
      [...this.characters.values()].map((c) => [c.name.toLowerCase(), c]),
    );
    for await (const senseFile of walkFiles(`${dataDir}/sense`)) {
      const character = byName.get(stem(senseFile).toLowerCase());
      if (!character) continue;
      const raw = await readText(senseFile);
      this.playerSenseRaw.set(character.id, raw);
      for (const line of raw.split(/\r?\n/)) {
        const targetId = parseIntStrict(line.trim());
        if (Number.isNaN(targetId)) continue;
        if (
          this.characters.has(targetId) &&
          !character.sensePlayers.includes(targetId)
        ) character.sensePlayers.push(targetId);
        else if (
          this.nproto.has(targetId) &&
          !character.senseMobiles.includes(targetId)
        ) character.senseMobiles.push(targetId);
      }
    }
  }

  private async loadIntro(dataDir: string): Promise<void> {
    const byName = new Map(
      [...this.characters.values()].map((c) => [c.name.toLowerCase(), c]),
    );
    for await (const introFile of walkFiles(`${dataDir}/intro`)) {
      const character = byName.get(stem(introFile).toLowerCase());
      if (!character) continue;
      const raw = await readText(introFile);
      this.playerIntroRaw.set(character.id, raw);
      for (const line of raw.split(/\r?\n/)) {
        const parts = line.trim().split(/\s+/, 2);
        if (parts.length !== 2) continue;
        const dubbed = byName.get(parts[0].toLowerCase());
        if (dubbed) character.dubPlayers.set(dubbed.id, parts[1]);
      }
    }
  }

  private async loadCharacters(dataDir: string): Promise<void> {
    for await (
      const plrFile of globFiles(`${dataDir}/plrfiles`, ".plr", true)
    ) {
      if (![...stem(plrFile)].every((c) => c.charCodeAt(0) <= 0x7f)) continue;
      const character = parseCharacter(new Scanner(await readText(plrFile)));
      const username = this.charactersToAccount.get(character.name);
      if (!username) continue;
      character.username = username;
      this.characters.set(character.id, character);
    }
  }

  async loadFromFiles(dataDir: string): Promise<void> {
    await this.loadHelp(dataDir);
    await this.loadZones(dataDir);
    await this.loadOproto(dataDir);
    await this.loadNproto(dataDir);
    await this.loadRooms(dataDir);
    await this.loadDgproto(dataDir);
    await this.loadShops(dataDir);
    await this.loadGuilds(dataDir);
    await this.loadAssemblies(dataDir);
    await this.loadHouses(dataDir);
    await this.loadAccounts(dataDir);
    await this.loadCharacters(dataDir);
    await this.loadPlrobjs(dataDir);
    await this.loadPlrvars(dataDir);
    await this.loadPlralias(dataDir);
    await this.loadSense(dataDir);
    await this.loadIntro(dataDir);
  }
}

export async function prepareMigration(path: string): Promise<LegacyDatabase> {
  const db = new LegacyDatabase();
  await db.loadFromFiles(path);
  return db;
}

export async function test(): Promise<LegacyDatabase> {
  return await prepareMigration("data");
}
