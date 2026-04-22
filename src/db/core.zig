const std = @import("std");
const grid = @import("grid.zig");
const ecs = @import("mr_ecs");

pub const World = struct {
    allocator: std.mem.Allocator,
    next_id: u64 = 1,
    entities: ecs.Entities,
    by_id: std.AutoHashMap(u64, ecs.Entity),

    pub fn init(allocator: std.mem.Allocator) World {
        return World{
            .allocator = allocator,
            .entities = ecs.Entities.init(allocator),
            .by_id = std.AutoHashMap(u64, ecs.Entity).init(allocator),
        };
    }

    pub fn deinit(self: *World) void {
        self.entities.deinit();
        self.by_id.deinit();
    }
};
