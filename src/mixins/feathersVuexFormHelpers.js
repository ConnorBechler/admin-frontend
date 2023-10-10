/* eslint-disable no-underscore-dangle */
import NProgress from 'nprogress';
import arrayRemove from 'lodash/remove';
import { models } from '@/plugins/feathers-client';

export default {
  data() {
    return {
      clonesToSave: [],
      dirty: false,
    };
  },
  methods: {
    addCloneForSaving(obj) {
      let idField = 'id';
      if (obj.__isTemp) {
        idField = '__id';
      }
      if (!this.clonesToSave.some(o => o.id === obj[idField])) {
        this.clonesToSave.push({ id: obj[idField], name: obj.constructor.modelName });
      }
      this.bubbleData(this.clonesToSave);
    },
    bubbleData(data) {
      (data.length) ? this.dirty = true : this.dirty = false;
      this.$emit('update:cloneData', data);
    },
    removeCloneFromSaving(obj) {
      let idField = 'id';
      if (obj.__isTemp) {
        idField = '__id';
      }
      arrayRemove(this.clonesToSave, item => item.id === obj[idField]);
      this.bubbleData(this.clonesToSave);
    },
    removeRow(obj) {
      obj.deletedAt = Date.now();
      this.stageClone(obj);
    },
    deleteRow(obj) {
      this.unstageClone(obj);
      obj.remove().then(() => {
        delete models.api[obj.constructor.modelName].copiesById[obj.id];
      });
      this.bubbleData(this.clonesToSave);
      this.$emit('deleted');
    },
    saveRow(obj) {
      this.removeCloneFromSaving(obj);
      const ret = obj.commit();
      ret.save()
        .then(() => {
          this.$emit('saveSuccessful');
        })
        .catch((err) => {
          this.$emit('saveError', err);
        })
        .finally(() => {
          this.bubbleData(this.clonesToSave);
        });
    },
    cancelEdit(obj) {
      obj.reset();
      this.unstageClone(obj);
    },
    restoreRow(obj) {
      obj.deletedAt = null;
      this.unstageClone(obj);
    },
    resetRow(obj) {
      obj.reset();
      this.unstageClone(obj);
    },
    stageClone(obj) {
      this.$emit('stageClone', obj);
    },
    unstageClone(obj) {
      this.$emit('unstageClone', obj);
    },
    async addRow(type, parent, id, data) {
      NProgress.inc();
      let localData = {};
      if (parent && id) {
        localData[parent + 'Id'] = id;
      }
      if (data) {
        localData = { ...localData, ...data };
      }
      const obj = await new models.api[type](localData);
      obj.save();
      NProgress.done();
    },
    createClone(type, data) {
      if (data) {
        return new models.api[type](data);
      } else {
        return new models.api[type]();
      }
    },
    updateAll() {
      const processed = [];
      this.clonesToSave.forEach((item) => {
        NProgress.inc();
        const { copiesById, tempsById } = models.api[item.name];
        const clone = copiesById[item.id] || tempsById[item.__id];
        if (clone.deletedAt && clone.deletedAt != null) {
          clone.remove();
        } else {
          const ret = clone.commit();
          ret.save();
        }
        processed.push(item.id);
      });
      processed.forEach(id => arrayRemove(this.clonesToSave, item => item.id === id));
      this.bubbleData(this.clonesToSave);
      NProgress.done();
    },
  },
  // TODO: implement actual confirm dialog
  // TODO: duplicate solution to timeout modal
  beforeRouteLeave(to, from, next) {
    if (this.clonesToSave.length || this.dirty) {
      console.log('unsaved changes pop up display');
      next(false);
      NProgress.done();
    } else {
      next();
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (this.clonesToSave.length || this.dirty) {
      console.log('unsaved changes pop up display');
      next(false);
      NProgress.done();
    } else {
      next();
    }
  },
};
