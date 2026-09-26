using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using WomenTeens.Data;

namespace WomenTeens.Data;

/// <summary>
/// Позволяет EF Core Tools (dotnet ef) создавать DbContext в design-time
/// без запуска всего приложения (нужно для миграций).
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=peakguard;Username=postgres;Password=postgres");

        return new AppDbContext(optionsBuilder.Options);
    }
}
