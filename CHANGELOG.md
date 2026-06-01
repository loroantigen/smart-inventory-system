# Changelog

## [1.0.0] - 2024-01-01

### Added
- Initial release of Smart Inventory & Logistics Management System
- Complete authentication system with role-based access control
- Inventory management for non-consumable equipment
- Consumables management with stock tracking
- Request workflow with approval process
- User and department management
- Dashboard with analytics and charts
- Reports generation (Inventory, Consumables, Requests, Low Stock, Expiry)
- Notification system for alerts
- Audit logging for all activities
- File upload support
- QR code generation support
- Excel and PDF export functionality
- Responsive design with mobile support
- Docker deployment support
- Comprehensive API documentation

### Features
- **Admin**: Full system access, user management, settings, audit logs
- **Moderator**: Inventory/consumables management, request processing, reports
- **User**: View items, submit requests, track status, upload attachments

### Security
- Password hashing with bcrypt
- JWT session management
- Route protection via middleware
- Input validation with Zod
- Audit trail for all actions

### Database
- PostgreSQL with Prisma ORM
- 13 tables with proper relations
- Soft deletes for data integrity
- Comprehensive indexing

## [1.1.0] - Planned
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Barcode scanning integration
- [ ] Mobile app companion
- [ ] Advanced analytics
- [ ] Multi-warehouse support
- [ ] Purchase order management
- [ ] Supplier management portal