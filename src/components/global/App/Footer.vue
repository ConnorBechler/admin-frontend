<template>
  <v-footer app clipped-left class="msu light-grey black--text" height="auto">
    <v-container class="py-0 hidden-xs-only" >
      <v-row  justify="center" class="text-center">
        <v-col v-if="showContactRow" class="footer-right pb-0" cols="10" >
          <ul class="footer-row single-row">
            <li>
              Call Us: <a :href="'tel:' + this.phone">{{ this.phone }}</a>
            </li>
            <li>
              Email Us: <a :href="'mailto:' + this.email" target="_blank">{{ this.email }}</a>
            </li>
            <li>
              Visit: <a :href="sitelink" target="_blank">{{ this.sitelink }}</a>
            </li>
          </ul>
        </v-col>
        <v-col class="footer-right" :class="(showContactRow) ? 'pt-0' : ''" cols="10" >
          <ul class="footer-row single-row">
            <li><b>SPARTANS WILL.</b></li>
            <li> &copy;  Michigan State University</li>
          </ul>
        </v-col>
      </v-row>
    </v-container>
    <v-container class="hidden-sm-and-up py-0" >
      <v-row  justify="center" class="text-center">
        <v-col class="xs-footer" cols="8" >
            <b>SPARTANS WILL.</b>
            <br>
            &copy;  Michigan State University
        </v-col>
      </v-row>
    </v-container>

    <span class="version">
      v{{ this.version }}
    </span>
  </v-footer>
</template>

<script>
import { version } from '@/../package.json';

export default {
  props: {
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    sitelink: {
      type: String,
      default: '',
    },
    showContactRow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      version,
    };
  },
};
</script>

<style lang='scss'>
.version {
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: .75rem;
}
footer {
    padding: .25rem 0;
    a {
      text-decoration: none;
      color: #151a22;
      font-weight: 500;
    }
    ul {
      display: inline-block;
      list-style: none;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      li {
        display: inline;
      }
    }
  }
  .footer-left {
    margin-right: 2.25rem;
  }
  .footer-right {

  }
  .footer-row {
    letter-spacing: .0075rem;
    line-height: .75rem;
    font-size: .625rem;
    font-weight: 400;
    li {
      margin-left: .625rem;
      position: relative;
    }

    li:not(:first-of-type):before {
      background-color: rgba(0,0,0,0.1);
      content: '';
      height: .85rem;
      left: -.625rem;
      position: absolute;
      width: .135rem;
    }

    li:not(:first-of-type) {
      margin-left: 1.4rem;
    }

    li:first-child {
      margin-left: 0;
    }
    li:last-child {
      padding-right: 0;
    }
  }
  .single-row {
    font-size: .65rem;
  }
  .xs-footer {
    font-size: .75rem;
  }
  .row1 {
    font-size: 1rem;
    line-height: .8125rem;
    margin-bottom: 0px;
    padding-bottom: .35rem;
    border-bottom: .0625rem dotted #646464;
    letter-spacing: .015rem;
    li:not(:first-of-type) {
      margin-left: 1rem;
    }
  }
  .row2 {
    margin-top: .625rem;
  }
</style>
