const std = @import("std");
const db = @import("db/core.zig");

pub const Game = struct {
    allocator: std.mem.Allocator,
    io: std.Io,
    world: db.World,

    pub fn init(allocator: std.mem.Allocator, io: std.Io) !Game {
        return Game{
            .allocator = allocator,
            .io = io,
            .world = db.World.init(allocator),
        };
    }

    pub fn deinit(self: *Game) void {
        self.world.deinit();
    }
};
