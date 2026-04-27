const std = @import("std");

/// A GridPoint is used for describing a square on a grid.
pub const GridPoint = struct { x: i64, y: i64, z: i64 };

/// ShapeDimensions describes how far a shape extends in each direction from its center point.
pub const ShapeDimensions = struct { north: i64, south: i64, east: i64, west: i64, up: i64, down: i64 };

/// A Region "paints" wide scale terrain into a grid, radiating out from its center point.
pub const Region = struct {
    center: GridPoint,
    dimensions: ShapeDimensions,
    shape: i64,
    priority: u8,
    // still working out the rest...
    tile: []const u8,
};

/// A Spot exists at a specific point on the grid and overrides any underlying Regions.
pub const Spot = struct {
    point: GridPoint,
    // still working out the rest...
    tile: []const u8,
};

/// Returned by a search function to determine whichh spot and region are relevant at a given point.
pub const Place = struct { spot: *Spot, region: *Region };

/// The Grid is the main map data structure.
pub const Grid = struct {
    spots: std.AutoHashMap(GridPoint, Spot),
    regions: std.AutoHashMap(GridPoint, Region),
    /// If a character is entering this region without providing coordinates, what are the defaults?
    default_point: GridPoint,
};
