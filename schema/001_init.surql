DEFINE TABLE OVERWRITE user SCHEMALESS;
DEFINE TABLE OVERWRITE character SCHEMALESS;
DEFINE TABLE OVERWRITE item SCHEMALESS;
DEFINE TABLE OVERWRITE room SCHEMALESS;
DEFINE TABLE OVERWRITE zone SCHEMALESS;
DEFINE TABLE OVERWRITE structure SCHEMALESS;

DEFINE TABLE OVERWRITE npc_prototype SCHEMALESS;
DEFINE TABLE OVERWRITE item_prototype SCHEMALESS;
DEFINE TABLE OVERWRITE structure_prototype SCHEMALESS;

DEFINE TABLE OVERWRITE game_session SCHEMALESS;

-- With major types defined, now we can define fields and indexes...
-- USER
DEFINE FIELD OVERWRITE email ON user TYPE string VALUE $value.lower() ASSERT string::is_email($value);
DEFINE FIELD OVERWRITE password_hash ON user TYPE string;
DEFINE FIELD OVERWRITE components ON user TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON user TYPE object;
DEFINE FIELD OVERWRITE created_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON user TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON user TYPE set<string> DEFAULT <set>[];

DEFINE INDEX OVERWRITE unique_email
  ON user
  COLUMNS email
  UNIQUE;

-- Prototypes
DEFINE FIELD OVERWRITE name ON npc_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON npc_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON npc_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON npc_prototype TYPE object;
DEFINE FIELD OVERWRITE stats ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON npc_prototype TYPE int;
DEFINE FIELD OVERWRITE created_at ON npc_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON npc_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON npc_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON npc_prototype TYPE object;

DEFINE FIELD OVERWRITE name ON item_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON item_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON item_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON item_prototype TYPE object;
DEFINE FIELD OVERWRITE stats ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON item_prototype TYPE int;
DEFINE FIELD OVERWRITE created_at ON item_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON item_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON item_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON item_prototype TYPE object;

DEFINE FIELD OVERWRITE name ON structure_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON structure_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON structure_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON structure_prototype TYPE object;
DEFINE FIELD OVERWRITE stats ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON structure_prototype TYPE int;
DEFINE FIELD OVERWRITE created_at ON structure_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON structure_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON structure_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON structure_prototype TYPE object;

-- Player Characters. Any Character that doesn't have an entry in PC is an NPC.
DEFINE TABLE OVERWRITE pc SCHEMALESS TYPE RELATION in character OUT user ENFORCED;
DEFINE FIELD OVERWRITE last_login_at ON pc TYPE option<datetime> DEFAULT NONE;

DEFINE INDEX OVERWRITE unique_pc
  ON pc
  COLUMNS in
  UNIQUE;

-- CHARACTER
DEFINE FIELD OVERWRITE name ON character TYPE string;
DEFINE FIELD OVERWRITE description ON character TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON character TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE prototype ON character TYPE option<record<npc_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON character TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON character TYPE object;
DEFINE FIELD OVERWRITE stats ON character TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON character TYPE int;
DEFINE FIELD OVERWRITE created_at ON character TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON character TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON character TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON character TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON character TYPE object;
DEFINE FIELD OVERWRITE cooldowns ON character TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE cooldowns.* ON character TYPE datetime;


-- ITEM
DEFINE FIELD OVERWRITE name ON item TYPE string;
DEFINE FIELD OVERWRITE description ON item TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON item TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON item TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON item TYPE object;
DEFINE FIELD OVERWRITE stats ON item TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON item TYPE int;
DEFINE FIELD OVERWRITE created_at ON item TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON item TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON item TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON item TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON item TYPE object;

-- If a character holds the item at all, this is that character. This is separate from Location,
-- as it ignores any possible inventory nesting.
DEFINE FIELD OVERWRITE holder ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
-- An Item's actual owner, which may be different from the holder.
DEFINE FIELD OVERWRITE owner ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
DEFINE FIELD OVERWRITE prototype ON item TYPE option<record<item_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;

-- STRUCTURE
DEFINE FIELD OVERWRITE name ON structure TYPE string;
DEFINE FIELD OVERWRITE description ON structure TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON structure TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE prototype ON structure TYPE option<record<structure_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON structure TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON structure TYPE object;
DEFINE FIELD OVERWRITE stats ON structure TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON structure TYPE int;
DEFINE FIELD OVERWRITE created_at ON structure TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON structure TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON structure TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON structure TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON structure TYPE object;

-- ROOM
DEFINE FIELD OVERWRITE name ON room TYPE string;
DEFINE FIELD OVERWRITE description ON room TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE within ON room TYPE record<zone|structure> REFERENCE ON DELETE REJECT;
DEFINE FIELD OVERWRITE components ON room TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON room TYPE object;
DEFINE FIELD OVERWRITE stats ON room TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON room TYPE int;
DEFINE FIELD OVERWRITE created_at ON room TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON room TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON room TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON room TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON room TYPE object;

-- EXITS
DEFINE TABLE OVERWRITE exit SCHEMALESS TYPE RELATION in room out room ENFORCED;
DEFINE FIELD OVERWRITE direction ON exit TYPE string;
DEFINE FIELD OVERWRITE description ON exit TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON exit TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON exit TYPE object;
DEFINE FIELD OVERWRITE created_at ON exit TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON exit TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON exit TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON exit TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON exit TYPE object;

DEFINE INDEX unique_direction_per_room
  ON exit
  COLUMNS in, direction
  UNIQUE;

-- ZONE
DEFINE FIELD OVERWRITE name ON zone TYPE string;
DEFINE FIELD OVERWRITE description ON zone TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE parent ON zone TYPE option<record<zone>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD OVERWRITE children ON zone COMPUTED <~ zone;
DEFINE FIELD OVERWRITE components ON zone TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE components.* ON zone TYPE object;
DEFINE FIELD OVERWRITE stats ON zone TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE stats.* ON zone TYPE int;
DEFINE FIELD OVERWRITE created_at ON zone TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON zone TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD OVERWRITE tags ON zone TYPE set<string> DEFAULT <set>[];
DEFINE FIELD OVERWRITE scripts ON zone TYPE object DEFAULT {};
DEFINE FIELD OVERWRITE scripts.* ON zone TYPE object;


-- Location relation.
DEFINE TABLE OVERWRITE located_in SCHEMALESS TYPE RELATION IN character|item|structure OUT room|structure|character|item ENFORCED;
DEFINE FIELD OVERWRITE slots ON located_in TYPE option<array<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE created_at ON located_in TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE updated_at ON located_in TYPE datetime DEFAULT time::now() VALUE time::now();

DEFINE INDEX OVERWRITE unique_location_subject
  ON located_in
  COLUMNS in
  UNIQUE;

DEFINE FUNCTION OVERWRITE fn::get_contents($thing: record) -> array<record> {
    RETURN SELECT VALUE in
      FROM located_in
      WHERE out == $thing AND in.slots == NONE;
};

DEFINE FUNCTION OVERWRITE fn::get_equipment($thing: record) -> object {
    -- Scan all items located_in $thing, create a map for all with an equipped slot and return <slot, record> object.
    LET $items = SELECT in,in.slots
      FROM located_in
      WHERE out == $thing AND in.slots != NONE;
    RETURN object::from_entries(
  $items
    .map(|$item| {
      $item.slots.map(|$slot| {
        [$slot, $item.in]
      })
    })
    .flatten());
};

-- Equipment is a computed field that looks up all equipped Objects.
DEFINE FIELD OVERWRITE equipment ON character COMPUTED fn::get_equipment($this.id) TYPE object;
DEFINE FIELD OVERWRITE equipment ON item COMPUTED fn::get_equipment($this.id) TYPE object;
DEFINE FIELD OVERWRITE equipment ON structure COMPUTED fn::get_equipment($this.id) TYPE object;

DEFINE FIELD OVERWRITE inventory ON character COMPUTED fn::get_contents($this.id) TYPE array<record<item>>;
DEFINE FIELD OVERWRITE inventory ON structure COMPUTED fn::get_contents($this.id) TYPE array<record<item>>;
DEFINE FIELD OVERWRITE inventory ON item COMPUTED fn::get_contents($this.id) TYPE array<record<item>>;

DEFINE FIELD OVERWRITE contents ON room COMPUTED fn::get_contents($this.id) TYPE array<record<item>>;



-- Events and Session stuff below this.
