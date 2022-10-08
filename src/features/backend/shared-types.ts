export type Sampler = 'Euler a'| 'Euler'| 'LMS'| 'Heun'| 'DPM2'|'DPM2 a'| 'DDIM'| 'PLMS'

// Base
export interface BaseInputItem {
    type: string
}

export interface BaseProcessingItem<IN extends BaseInputItem, OUT> {
    id: string
    input: IN
    processing: boolean
    error?: string
    output?: OUT,
}


export interface X2ImgInput extends BaseInputItem{
    prompt: string
    width: number
    height: number
    cfg: string // decimal number
    seed: string
    sampler: Sampler
    steps: number
    tiling: boolean
}

// Txt2Img

export interface Txt2ImgInput extends X2ImgInput{
    type: 'txt2img'
}

export interface Txt2ImgOutput {
    result: string // image path
    // time per step
    // total time?
}

export interface Txt2ImgItem extends BaseProcessingItem<Txt2ImgInput, Txt2ImgOutput>{}

// Img2Img

export interface Img2ImgInput extends X2ImgInput {
    type: 'img2img'
    image: string // image path! or base64?
    mask?: string // image path! or base64?
}

export interface Img2ImgOutput extends Txt2ImgOutput{}
export interface Img2ImgItem extends BaseProcessingItem<Img2ImgInput, Img2ImgOutput>{}

// Unions

export type ProcessingItem = Txt2ImgItem | Img2ImgItem
export type InputItem = Txt2ImgInput | Img2ImgInput



