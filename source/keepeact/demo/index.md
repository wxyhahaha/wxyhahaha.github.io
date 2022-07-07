---
title: Keepeact Demo
date: 2022-07-04 11:08:20
---

<div id="wrapper" style="margin-bottom: 16px">
  <div id="demo"></div>
</div>
<script type="module">
  import { WelCome } from '/js/keepeact.js';
  WelCome.create(document.querySelector('#demo'), {
    valueChange(e) {
      console.log('count:', e);
    }
  })
</script>


```html
<body>
  <div id="wrapper">
    <div id="demo"></div>
  </div>
</body>
<script type="module">
  import { WelCome } from '/js/keepeact.js';
  WelCome.create(document.querySelector('#demo'), {
    valueChange(e) {
      console.log('coutn:', e);
    }
  })
</script>
```

```tsx
// Button
import { ValueComponent, Component, Watch, Prop, Ref } from 'keepeact';

@Component()
export default class Button extends ValueComponent {
  count = 0;
  showStop = true;
  @Prop() defaultCount: number;
  @Prop() max: number = 3;
  @Ref('button') buttonEl: HTMLElement;
  @Watch('count', {
    immediate: true,
  })
  countChange(a, b) {
    console.log('监测 count:', `oldValue: ${a}`, `newValue: ${b}`);
    this.showStop = this.count > this.max;
  }

  get countValue() {
    return this.showStop ? 'stop' : this.count;
  }

  button() {
    this.$nextTick(() => {
      console.log(this.buttonEl.innerText);
    });
    return (
      <button
        onClick={() => {
          if (this.showStop) return;
          this.count++;
          this.onChange(this.count);
        }}
      >
        click+1
      </button>
    );
  }
  render() {
    return (
      <div id="wuxunyu" ref="button">
        {this.countValue} {this.button()}
      </div>
    );
  }
}

```


```tsx
// WelCome
import { Component, ValueComponent } from 'keepeact';
import Button from './button/button.component';

@Component()
export default class WelCome extends ValueComponent {
  max = 6;
  buttonDemo() {
    return (
      <Button
        valueChange={(e) => {
          this.onChange(e);
        }}
        max={this.max}
      ></KButton>
    );
  }
  render() {
    const welcomeWrapper = (
      <div>
        <p>WelCome to Keepeact, I wish you like it.</p>
          <p>demo:  well stop, if count {'>'} {this.max}</p>
        <ul>
          <li>{this.buttonDemo()}</li>
        </ul>
      </div>
    );
    return welcomeWrapper;
  }
}

```