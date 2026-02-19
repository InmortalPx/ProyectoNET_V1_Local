var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

var productos = new List<Producto>
{
    new Producto(1, "Manzana", 500),
    new Producto(2, "Pan", 1200)
};

app.MapGet("/productos", () => productos);

app.MapGet("/productos/{id}", (int id) =>
{
    var p = productos.FirstOrDefault(x => x.Id == id);
    return p is null ? Results.NotFound() : Results.Ok(p);
});

app.MapPost("/productos", (Producto nuevo) =>
{
    nuevo = nuevo with { Id = productos.Count + 1 };
    productos.Add(nuevo);
    return Results.Created($"/productos/{nuevo.Id}", nuevo);
});

app.MapPut("/productos/{id}", (int id, Producto actualizado) =>
{
    var index = productos.FindIndex(x => x.Id == id);
    if (index == -1) return Results.NotFound();
    productos[index] = actualizado with { Id = id };
    return Results.Ok(productos[index]);
});

app.MapDelete("/productos/{id}", (int id) =>
{
    var p = productos.FirstOrDefault(x => x.Id == id);
    if (p is null) return Results.NotFound();
    productos.Remove(p);
    return Results.NoContent();
});

app.Run();

// "record" es como una clase simple pero inmutable, ideal para modelos de datos
record Producto(int Id, string Nombre, decimal Precio);