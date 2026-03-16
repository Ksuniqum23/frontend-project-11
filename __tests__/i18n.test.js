import { describe, it, expect } from 'vitest'
import i18n from '../src/i18n/init.js'

describe('i18n', () => {
    it('should be initialized with Russian language', () => {
        expect(i18n.language).toBe('ru')
    })

    it('should translate success.addRSS', () => {
        expect(i18n.t('success.addRSS')).toBe('RSS успешно загружен')
    })

    it('should translate errors.required', () => {
        expect(i18n.t('errors.required')).toBe('Ссылка обязательна')
    })

    it('should translate errors.invalidUrl', () => {
        expect(i18n.t('errors.invalidUrl')).toBe('Ссылка должна быть валидным URL')
    })

    it('should translate errors.addRSS', () => {
        expect(i18n.t('errors.addRSS')).toBe('RSS уже существует')
    })

    it('should translate errors.invalidRss', () => {
        expect(i18n.t('errors.invalidRss')).toBe('Ресурс не содержит валидный RSS')
    })

    it('should translate errors.network', () => {
        expect(i18n.t('errors.network')).toBe('Ошибка сети')
    })

    it('should translate ui.name', () => {
        expect(i18n.t('ui.name')).toBe('RSS - агрегатор')
    })

    it('should return key for missing translation', () => {
        expect(i18n.t('nonexistent.key')).toBe('nonexistent.key')
    })
})
