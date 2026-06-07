import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  schema.pre('find', function () {
    const filter = this.getFilter();
    if (filter.delete_at === undefined && filter.isDeleted === undefined) {
      this.where({ delete_at: null });
    }
  });

  schema.pre('findOne', function () {
    const filter = this.getFilter();
    if (filter.delete_at === undefined && filter.isDeleted === undefined) {
      this.where({ delete_at: null });
    }
  });

  schema.pre('countDocuments', function () {
    const filter = this.getFilter();
    if (filter.delete_at === undefined && filter.isDeleted === undefined) {
      this.where({ delete_at: null });
    }
  });
}
