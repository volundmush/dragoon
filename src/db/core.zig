const std = @import("std");
const grid = @import("grid.zig");
const ecs = @import("mr_ecs");

const zlua = @import("zlua");

const Lua = zlua.Lua;
const LuaType = zlua.LuaType;

pub const Race = struct {
    id: []const u8,
    name: []const u8,

    pub fn deinit(self: Race, allocator: std.mem.Allocator) void {
        allocator.free(self.id);
        allocator.free(self.name);
    }
};

pub const World = struct {
    allocator: std.mem.Allocator,
    next_id: u64 = 1,
    entities: ecs.Entities,
    by_id: std.AutoHashMap(u64, ecs.Entity),
    lua: *Lua,
    races: std.StringHashMap(Race),

    pub fn init(allocator: std.mem.Allocator) !World {
        return World{
            .allocator = allocator,
            .entities = try ecs.Entities.init(.{ .gpa = allocator }),
            .by_id = std.AutoHashMap(u64, ecs.Entity).init(allocator),
            .lua = try Lua.init(allocator),
            .races = std.StringHashMap(Race).init(allocator),
        };
    }

    pub fn deinit(self: *World) void {
        var race_iter = self.races.valueIterator();
        while (race_iter.next()) |race| race.deinit(self.allocator);
        self.races.deinit();
        self.entities.deinit(self.allocator);
        self.by_id.deinit();
        self.lua.deinit();
    }

    pub fn loadRaces(self: *World, io: std.Io, dir_path: []const u8) !void {
        const dir = try std.Io.Dir.cwd().openDir(io, dir_path, .{ .iterate = true });
        defer dir.close(io);

        var iter = dir.iterate();
        while (try iter.next(io)) |entry| {
            if (entry.kind != .file or !std.mem.endsWith(u8, entry.name, ".lua")) continue;

            const file_path = try std.fs.path.join(self.allocator, &.{ dir_path, entry.name });
            defer self.allocator.free(file_path);

            const race = try self.loadRaceFile(file_path);
            errdefer race.deinit(self.allocator);

            if (self.races.contains(race.id)) return error.DuplicateRaceId;
            try self.races.put(race.id, race);
        }
    }

    fn loadRaceFile(self: *World, file_path: []const u8) !Race {
        const stack_top = self.lua.getTop();
        defer self.lua.setTop(stack_top);

        const file_path_z = try self.allocator.dupeZ(u8, file_path);
        defer self.allocator.free(file_path_z);

        try self.lua.doFile(file_path_z);
        if (!self.lua.isTable(-1)) return error.InvalidRaceDefinition;

        const table_index = self.lua.absIndex(-1);
        const id = try self.getRequiredString(table_index, "id");
        errdefer self.allocator.free(id);
        const name = try self.getRequiredString(table_index, "name");
        errdefer self.allocator.free(name);

        return .{
            .id = id,
            .name = name,
        };
    }

    fn getRequiredString(self: *World, table_index: i32, comptime field: [:0]const u8) ![]const u8 {
        if (self.lua.getField(table_index, field) != LuaType.string) {
            self.lua.pop(1);
            return error.InvalidRaceDefinition;
        }
        defer self.lua.pop(1);

        return try self.allocator.dupe(u8, try self.lua.toString(-1));
    }
};
