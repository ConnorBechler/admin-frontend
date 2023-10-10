/* eslint-disable no-underscore-dangle */
import moment from 'moment';

export default {
  methods: {
    toSexagesimal(time, unit) {
      if (time) {
        const d = moment.duration(time, unit);
        return d.hours().toString().padStart(2, 0)
          + ':' + d.minutes().toString().padStart(2, 0)
          + ':' + d.seconds().toString().padStart(2, 0);
      } else {
        return 'n/a';
      }
    },
    speakingTime(time, unit) {
      let out = '';
      if (time) {
        const d = moment.duration(time, unit);
        if (d.hours()) {
          out += d.hours();
          out += (d.hours() === 1) ? ' hour, ' : ' hours, ';
        }
        if (d.minutes()) {
          out += d.minutes();
          out += (d.minutes() === 1) ? ' minute, ' : ' minutes, ';
        }
        if (d.seconds()) {
          out += d.seconds();
          out += (d.seconds() === 1) ? ' second' : ' seconds';
        }
        return out;
      } else {
        return 'n/a';
      }
    },
  },
};
