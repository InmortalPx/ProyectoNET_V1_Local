using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer("Server=localhost,1433;Database=ProductosDB;User Id=sa;Password=contraseña123!;TrustServerCertificate=True"));

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/productos", async (AppDbContext db) =>
    await db.Productos.ToListAsync());

app.MapGet("/productos/{id}", async (int id, AppDbContext db) =>
{
    var p = await db.Productos.FindAsync(id);
    return p is null ? Results.NotFound() : Results.Ok(p);
});

app.MapPost("/productos", async (Producto nuevo, AppDbContext db) =>
{
    db.Productos.Add(nuevo);
    await db.SaveChangesAsync();
    return Results.Created($"/productos/{nuevo.Id}", nuevo);
});

app.MapPut("/productos/{id}", async (int id, Producto actualizado, AppDbContext db) =>
{
    var p = await db.Productos.FindAsync(id);
    if (p is null) return Results.NotFound();
    p.Nombre = actualizado.Nombre;
    p.Precio = actualizado.Precio;
    await db.SaveChangesAsync();
    return Results.Ok(p);
});

app.MapDelete("/productos/{id}", async (int id, AppDbContext db) =>
{
    var p = await db.Productos.FindAsync(id);
    if (p is null) return Results.NotFound();
    db.Productos.Remove(p);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Producto> Productos { get; set; }
}

class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public decimal Precio { get; set; }
}