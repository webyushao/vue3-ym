let activeScopeEffect
class EffectScope {
  effects = []
  parent = null
  active = true
  constructor () {

  }
  run (fn) {
    try {
      this.parent = activeScopeEffect
      activeScopeEffect = this
      return fn()
    } finally {
      activeScopeEffect = this.parent
      this.parent = null
    }
  }
  stop () {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop()
      }

      this.active = false
    }
  }
}

export function recordEffectScope (effect) {
  if (activeScopeEffect && activeScopeEffect.active) {
    activeScopeEffect.effect.push(effect)
  }
}

export function effectScope () {
  return new EffectScope()
}