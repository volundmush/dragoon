DEFINE TABLE user SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE character SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE item SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE room SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE zone SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE structure SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;

DEFINE TABLE npc_prototype SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE item_prototype SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE structure_prototype SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;

DEFINE TABLE commodity SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;

DEFINE TABLE game_session SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE game_input SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;
DEFINE TABLE game_output SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;

DEFINE TABLE game_event SCHEMALESS CHANGEFEED 2w
  PERMISSIONS
    FOR SELECT
      WHERE true
    FOR CREATE,UPDATE,DELETE
      WHERE $auth.admin_level > 0;

-- With major types defined, now we can define fields and indexes...
-- USER
DEFINE FIELD email ON user TYPE string VALUE $value.lower() ASSERT string::is_email($value)
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;
DEFINE FIELD display_name ON user TYPE option<string> DEFAULT NONE
  PERMISSIONS
    FOR SELECT
      WHERE true;
DEFINE FIELD password_hash ON user TYPE string PERMISSIONS NONE;
DEFINE FIELD components ON user TYPE object DEFAULT {}
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;
DEFINE FIELD components.* ON user TYPE object
  PERMISSIONS
    FOR SELECT
      WHERE true;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now()
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;
DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now() VALUE time::now()
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;
DEFINE FIELD tags ON user TYPE set<string> DEFAULT <set>[]
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;
DEFINE FIELD admin_level ON user TYPE int DEFAULT 0
  PERMISSIONS
    FOR SELECT
      WHERE $this.id == $auth.id OR $auth.admin_level > 0;

DEFINE INDEX unique_email
  ON user
  COLUMNS email
  UNIQUE;

DEFINE ACCESS user ON DATABASE TYPE RECORD
   SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
	 SIGNIN ( SELECT * FROM user WHERE email = $email.lower() AND crypto::argon2::compare(pass, $pass) )
   WITH JWT
   WITH REFRESH
   DURATION FOR GRANT 30d, FOR TOKEN 30m, FOR SESSION 12h;

-- Prototypes
DEFINE FIELD name ON npc_prototype TYPE string;
DEFINE FIELD description ON npc_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON npc_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD components ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD components.* ON npc_prototype TYPE object;
DEFINE FIELD stats ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD stats.* ON npc_prototype TYPE int;
DEFINE FIELD created_at ON npc_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON npc_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON npc_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON npc_prototype TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON npc_prototype TYPE object;

DEFINE FIELD name ON item_prototype TYPE string;
DEFINE FIELD description ON item_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON item_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD components ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD components.* ON item_prototype TYPE object;
DEFINE FIELD stats ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD stats.* ON item_prototype TYPE int;
DEFINE FIELD created_at ON item_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON item_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON item_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON item_prototype TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON item_prototype TYPE object;

DEFINE FIELD name ON structure_prototype TYPE string;
DEFINE FIELD description ON structure_prototype TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON structure_prototype TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD components ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD components.* ON structure_prototype TYPE object;
DEFINE FIELD stats ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD stats.* ON structure_prototype TYPE int;
DEFINE FIELD created_at ON structure_prototype TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON structure_prototype TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON structure_prototype TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON structure_prototype TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON structure_prototype TYPE object;

-- Player Characters. Any Character that doesn't have an entry in PC is an NPC.
DEFINE TABLE pc SCHEMALESS TYPE RELATION in character OUT user ENFORCED;
DEFINE FIELD last_login_at ON pc TYPE option<datetime> DEFAULT NONE;

DEFINE INDEX unique_pc
  ON pc
  COLUMNS in
  UNIQUE;

-- CHARACTER
DEFINE FIELD name ON character TYPE string;
DEFINE FIELD description ON character TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON character TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD prototype ON character TYPE option<record<npc_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD components ON character TYPE object DEFAULT {};
DEFINE FIELD components.* ON character TYPE object;
DEFINE FIELD stats ON character TYPE object DEFAULT {};
DEFINE FIELD stats.* ON character TYPE int;
DEFINE FIELD created_at ON character TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON character TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON character TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON character TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON character TYPE object;
DEFINE FIELD cooldowns ON character TYPE object DEFAULT {};
DEFINE FIELD cooldowns.* ON character TYPE datetime;


-- ITEM
DEFINE FIELD name ON item TYPE string;
DEFINE FIELD description ON item TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON item TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD components ON item TYPE object DEFAULT {};
DEFINE FIELD components.* ON item TYPE object;
DEFINE FIELD stats ON item TYPE object DEFAULT {};
DEFINE FIELD stats.* ON item TYPE int;
DEFINE FIELD created_at ON item TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON item TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON item TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON item TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON item TYPE object;

-- If a character holds the item at all, this is that character. This is separate from Location,
-- as it ignores any possible inventory nesting.
DEFINE FIELD holder ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
-- An Item's actual owner, which may be different from the holder.
DEFINE FIELD owner ON item TYPE option<record<character>> REFERENCE ON DELETE UNSET DEFAULT NONE;
DEFINE FIELD prototype ON item TYPE option<record<item_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;

-- STRUCTURE
DEFINE FIELD name ON structure TYPE string;
DEFINE FIELD description ON structure TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON structure TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD prototype ON structure TYPE option<record<structure_prototype>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD components ON structure TYPE object DEFAULT {};
DEFINE FIELD components.* ON structure TYPE object;
DEFINE FIELD stats ON structure TYPE object DEFAULT {};
DEFINE FIELD stats.* ON structure TYPE int;
DEFINE FIELD created_at ON structure TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON structure TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON structure TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON structure TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON structure TYPE object;

-- ROOM
DEFINE FIELD name ON room TYPE string;
DEFINE FIELD description ON room TYPE option<string> DEFAULT NONE;
DEFINE FIELD within ON room TYPE record<zone|structure> REFERENCE ON DELETE REJECT;
DEFINE FIELD components ON room TYPE object DEFAULT {};
DEFINE FIELD components.* ON room TYPE object;
DEFINE FIELD stats ON room TYPE object DEFAULT {};
DEFINE FIELD stats.* ON room TYPE int;
DEFINE FIELD created_at ON room TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON room TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON room TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON room TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON room TYPE object;

-- EXITS
DEFINE TABLE exit SCHEMALESS TYPE RELATION in room out room ENFORCED;
DEFINE FIELD direction ON exit TYPE string;
DEFINE FIELD description ON exit TYPE option<string> DEFAULT NONE;
DEFINE FIELD components ON exit TYPE object DEFAULT {};
DEFINE FIELD components.* ON exit TYPE object;
DEFINE FIELD created_at ON exit TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON exit TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON exit TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON exit TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON exit TYPE object;

DEFINE INDEX unique_direction_per_room
  ON exit
  COLUMNS in, direction
  UNIQUE;

-- ZONE
DEFINE FIELD name ON zone TYPE string;
DEFINE FIELD description ON zone TYPE option<string> DEFAULT NONE;
DEFINE FIELD parent ON zone TYPE option<record<zone>> REFERENCE ON DELETE REJECT DEFAULT NONE;
DEFINE FIELD children ON zone COMPUTED <~ zone;
DEFINE FIELD components ON zone TYPE object DEFAULT {};
DEFINE FIELD components.* ON zone TYPE object;
DEFINE FIELD stats ON zone TYPE object DEFAULT {};
DEFINE FIELD stats.* ON zone TYPE int;
DEFINE FIELD created_at ON zone TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON zone TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON zone TYPE set<string> DEFAULT <set>[];
DEFINE FIELD scripts ON zone TYPE object DEFAULT {};
DEFINE FIELD scripts.* ON zone TYPE object;

-- Commodities
DEFINE FIELD name ON commodity TYPE string;
DEFINE FIELD description ON commodity TYPE option<string> DEFAULT NONE;
DEFINE FIELD keywords ON commodity TYPE option<set<string>> DEFAULT NONE;
DEFINE FIELD components ON commodity TYPE object DEFAULT {};
DEFINE FIELD components.* ON commodity TYPE object;
DEFINE FIELD stats ON commodity TYPE object DEFAULT {};
DEFINE FIELD stats.* ON commodity TYPE int;
DEFINE FIELD created_at ON commodity TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON commodity TYPE datetime DEFAULT time::now() VALUE time::now();
DEFINE FIELD tags ON commodity TYPE set<string> DEFAULT <set>[];

-- Commodities Relation
DEFINE TABLE has_commodity SCHEMALESS TYPE RELATION IN character|item|structure|room OUT commodity ENFORCED;
DEFINE FIELD amount ON has_commodity TYPE int DEFAULT 1 ASSERT $value > 0;
DEFINE FIELD created_at ON has_commodity TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON has_commodity TYPE datetime DEFAULT time::now() VALUE time::now();

DEFINE INDEX unique_commodity_subject
  ON has_commodity
  COLUMNS in, out
  UNIQUE;

-- Location relation.
DEFINE TABLE located_in SCHEMALESS TYPE RELATION IN character|item|structure OUT room|structure|character|item ENFORCED;
DEFINE FIELD slots ON located_in TYPE option<array<string>> DEFAULT NONE;
DEFINE FIELD created_at ON located_in TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON located_in TYPE datetime DEFAULT time::now() VALUE time::now();

DEFINE INDEX unique_location_subject
  ON located_in
  COLUMNS in
  UNIQUE;

DEFINE FUNCTION fn::get_at_location($thing: record, tb: string) -> array<record> {
    RETURN SELECT VALUE in
      FROM located_in
      WHERE out == $thing AND type::table(in) == tb;
};

DEFINE FUNCTION fn::get_inventory($thing: record) -> array<record<item>> {
    RETURN SELECT VALUE in
      FROM located_in
      WHERE out == $thing AND type::table(in) == "item" AND slots == NONE;
};

DEFINE FUNCTION fn::get_contents($thing: record) -> array<record<item|character|structure>> {
  RETURN SELECT VALUE in FROM
    located_in
    WHERE out == $thing AND in.is_active == true;
};

DEFINE FUNCTION fn::is_npc($character: record<character>) -> bool {
  LET $pc = SELECT VALUE id FROM pc WHERE in == $character LIMIT 1;
  RETURN $pc.len() == 0;
};

DEFINE FUNCTION fn::is_character_active($character: record<character>) -> bool {
  LET $sessions = SELECT VALUE id
    FROM game_session
    WHERE character == $character OR puppet == $character
    LIMIT 1;

  RETURN fn::is_npc($character) OR $sessions.len() > 0;
};

DEFINE FUNCTION fn::is_item_active($item: record<item>) -> bool {
  LET $holder = SELECT VALUE holder FROM ONLY $item;

  IF $holder == NONE {
    RETURN true;
  };

  RETURN fn::is_character_active($holder);
};

DEFINE FUNCTION fn::get_equipment($thing: record) -> object {
    -- Scan all items located_in $thing, create a map for all with an equipped slot and return <slot, record> object.
    LET $items = SELECT in, slots
      FROM located_in
      WHERE out == $thing AND type::table(in) == "item" AND slots != NONE;
    RETURN object::from_entries(
  $items
    .map(|$item| {
      $item.slots.map(|$slot| {
        [$slot, $item.in]
      })
    })
    .flatten());
};

DEFINE FIELD is_npc ON character COMPUTED fn::is_npc($this.id) TYPE bool;
DEFINE FIELD is_active ON character COMPUTED fn::is_character_active($this.id) TYPE bool;
DEFINE FIELD is_active ON item COMPUTED fn::is_item_active($this.id) TYPE bool;
DEFINE FIELD is_active ON structure COMPUTED true TYPE bool;


-- Session stuff.
DEFINE FIELD character ON game_session TYPE record<character> REFERENCE ON DELETE CASCADE;
DEFINE FIELD puppet ON game_session TYPE record<character> REFERENCE ON DELETE CASCADE;
DEFINE FIELD user ON game_session TYPE record<user> REFERENCE ON DELETE CASCADE;
DEFINE FIELD started_at ON game_session TYPE datetime DEFAULT time::now();
DEFINE FIELD active_at ON game_session TYPE datetime DEFAULT time::now();

DEFINE FIELD sessions ON user COMPUTED <~ game_session;
DEFINE FIELD sessions ON character COMPUTED <~ game_session;

-- Game input and output
DEFINE FIELD session ON game_input TYPE record<game_session> REFERENCE ON DELETE CASCADE;
DEFINE FIELD kind ON game_input TYPE string;
DEFINE FIELD payload ON game_input TYPE object DEFAULT {};
DEFINE FIELD created_at ON game_input TYPE datetime DEFAULT time::now();
DEFINE FIELD handled_at ON game_input TYPE option<datetime> DEFAULT NONE;

DEFINE INDEX game_input_session_created_at
  ON game_input
  COLUMNS session, created_at;

DEFINE FIELD session ON game_output TYPE record<game_session> REFERENCE ON DELETE CASCADE;
DEFINE FIELD kind ON game_output TYPE string;
DEFINE FIELD payload ON game_output TYPE object DEFAULT {};
DEFINE FIELD created_at ON game_output TYPE datetime DEFAULT time::now();

DEFINE INDEX game_output_session_created_at
  ON game_output
  COLUMNS session, created_at;

-- Game events
DEFINE FIELD kind ON game_event TYPE string;
DEFINE FIELD payload ON game_event TYPE object DEFAULT {};
DEFINE FIELD created_at ON game_event TYPE datetime DEFAULT time::now();
DEFINE FIELD handled_at ON game_event TYPE option<datetime> DEFAULT NONE;
