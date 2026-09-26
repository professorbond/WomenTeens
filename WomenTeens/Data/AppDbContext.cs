using Microsoft.EntityFrameworkCore;
using WomenTeens.Models;

namespace WomenTeens.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<AuditIssue> AuditIssues => Set<AuditIssue>();
    public DbSet<TripMonitor> Monitors => Set<TripMonitor>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Trip → AuditIssues: один ко многим, cascade delete
        modelBuilder.Entity<AuditIssue>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Trip)
                  .WithMany(t => t.Issues)
                  .HasForeignKey(e => e.TripId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Severity).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Text).IsRequired();
        });

        // Trip → TripMonitor: один к одному, cascade delete
        modelBuilder.Entity<TripMonitor>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Trip)
                  .WithOne(t => t.Monitor)
                  .HasForeignKey<TripMonitor>(e => e.TripId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.ContactName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ContactPhone).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ContactEmail).HasMaxLength(256).IsRequired();
        });

        // Trip конфигурация
        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Experience).HasMaxLength(20).IsRequired();
            entity.Property(e => e.RiskLevel).HasMaxLength(20);
        });
    }
}
