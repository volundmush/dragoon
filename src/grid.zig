const std = @import("std");

/// A GridPoint is used for describing a square on a grid.
const GridPoint = struct {
    x: i64,
    y: i64,
};

/// ShapeDimensions describes how far a shape extends in each direction from its center point.
const ShapeDimensions = struct {
    north: i64,
    south: i64,
    east: i64,
    west: i64,
};

/// A Region "paints" wide scale terrain into a grid, radiating out from its center point.
const Region = struct {
    center: GridPoint,
    dimensions: ShapeDimensions,
    shape: i64,
    priority: u8,
    // still working out the rest...

};

/// A Tile exists at a specific point on the grid and overrides any underlying Regions.
const Tile = struct {
    point: GridPoint,
    // still working out the rest...
};

/// Returned by a search function to determine whichh tile and region are relevant at a given point.
const Place = struct { tile: *Tile, region: *Region };

/// The Grid is the main map data structure.
const Grid = struct {
    tiles: std.AutoHashMap(GridPoint, Tile),
    regions: std.AutoHashMap(GridPoint, Region),
    /// If a character is entering this region without providing coordinates, what are the defaults?
    default_point: GridPoint,
};
