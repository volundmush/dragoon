DEFINE TABLE OVERWRITE user SCHEMALESS;
DEFINE TABLE OVERWRITE character SCHEMALESS;
DEFINE TABLE OVERWRITE item SCHEMALESS;
DEFINE TABLE OVERWRITE room SCHEMALESS;
DEFINE TABLE OVERWRITE zone SCHEMALESS;
DEFINE TABLE OVERWRITE structure SCHEMALESS;

DEFINE TABLE OVERWRITE npc_prototype SCHEMALESS;
DEFINE TABLE OVERWRITE item_prototype SCHEMALESS;
DEFINE TABLE OVERWRITE structure_prototype SCHEMALESS;

-- With major types defined, now we can define fields and indexes...
-- USER
DEFINE FIELD OVERWRITE email On user TYPE string VALUE $value.lower() ASSERT string::is::email($value);
DEFINE FIELD OVERWRITE password_hash On user TYPE string;
DEFINE FIELD OVERWRITE components ON user TYPE object FLEXIBLE DEFAULT {};

DEFINE INDEX OVERWRITE unique_email
  ON user
  COLUMNS email
  UNIQUE;

-- Prototypes
DEFINE FIELD OVERWRITE name ON npc_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON npc_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON npc_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON npc_prototype TYPE object FLEXIBLE DEFAULT {};

DEFINE FIELD OVERWRITE name ON item_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON item_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON item_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON item_prototype TYPE object FLEXIBLE DEFAULT {};

DEFINE FIELD OVERWRITE name ON structure_prototype TYPE string;
DEFINE FIELD OVERWRITE description ON structure_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON structure_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON structure_prototype TYPE object FLEXIBLE DEFAULT {};

-- CHARACTER
DEFINE FIELD OVERWRITE name ON character TYPE string;
DEFINE FIELD OVERWRITE description ON character TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON character TYPE option<set<string>> DEFAULT NONE;
-- A Character without a user is an NPC.
DEFINE FIELD OVERWRITE user ON character TYPE option<record<user>> REFERENCE ON DELETE CASCADE DEFAULT NONE;
DEFINE FIELD OVERWRITE prototype ON character TYPE option<record<npc_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON character TYPE object FLEXIBLE DEFAULT {};

-- ITEM
DEFINE FIELD OVERWRITE name ON item TYPE string;
DEFINE FIELD OVERWRITE description ON item TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE keywords ON item TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE equipped ON item TYPE option<array<string>> DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON item TYPE object FLEXIBLE DEFAULT {};

-- If a character holds the item at all, this is that character. This is separate from Location,
-- as it ignores any possible inventory nesting.
DEFINE FIELD OVERWRITE holder ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
-- An Item's actual owner, which may be different from the holder.
DEFINE FIELD OVERWRITE owner ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
DEFINE FIELD OVERWRITE prototype ON item TYPE option<record<item_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;

-- ROOM
DEFINE FIELD OVERWRITE name ON room TYPE string;
DEFINE FIELD OVERWRITE description ON room TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE within ON room TYPE record<zone|structure> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD OVERWRITE components ON room TYPE object FLEXIBLE DEFAULT {};

-- EXITS
DEFINE TABLE OVERWRITE exit SCHEMALESS TYPE RELATION in room out room ENFORCED;
DEFINE FIELD OVERWRITE direction ON exit TYPE string;

-- ZONE
DEFINE FIELD OVERWRITE name ON zone TYPE string;
DEFINE FIELD OVERWRITE description ON zone TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE parent ON zone TYPE option<record<zone>> REFERENCE ON DELETE REJECT DEFAULT NONE;

-- Location relation.
DEFINE TABLE OVERWRITE located_in SCHEMALESS TYPE RELATION IN character|item|structure OUT room|structure|character|item ENFORCED;

DEFINE INDEX OVERWRITE unique_location_subject
  ON located_in
  COLUMNS in
  UNIQUE;

DEFINE FUNCTION OVERWRITE fn::get_contents($thing: record) -> array<record> {
    RETURN SELECT VALUE in
      FROM located_in
      WHERE out = $thing.id AND in.equipped == NONE;
}

DEFINE FUNCTION OVERWRITE fn::get_equipment($thing: record) -> object {
    -- Scan all items located_in $thing, create a map for all with an equipped slot and return <slot, record> object.
    LET $items = SELECT VALUE in
      FROM located_in
      WHERE out = $thing.id AND in.equipped != NONE;
    RETURN object::from_entries(
  $items
    .map(|$item| {
      $item.equipped.map(|$slot| {
        [$slot, $item.id]
      })
    })
    .flatten());
}

-- Equipment is a computed field that looks up all equipped Objects.
DEFINE FIELD OVERWRITE equipment ON character COMPUTED fn::get_equipment($this) TYPE object;
DEFINE FIELD OVERWRITE equipment ON item COMPUTED fn::get_equipment($this) TYPE object;
DEFINE FIELD OVERWRITE equipment ON structure COMPUTED fn::get_equipment($this) TYPE object;

DEFINE FIELD OVERWRITE inventory ON character COMPUTED fn::get_contents($this) TYPE array<record<item>>;
DEFINE FIELD OVERWRITE inventory ON structure COMPUTED fn::get_contents($this) TYPE array<record<item>>;
DEFINE FIELD OVERWRITE inventory ON item COMPUTED fn::get_contents($this) TYPE array<record<item>>;

DEFINE FIELD OVERWRITE contents ON room COMPUTED fn::get_contents($this) TYPE array<record<item>>;