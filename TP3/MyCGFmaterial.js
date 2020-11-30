class MyCGFmaterial extends CGFappearance {
    
    constructor(scene) {
        super(scene);
    }

    /**
     * Applies a material without messing with textures
     * CGFappearance.apply() would casually unbind the current texture and change the value of this.activeTexture, so this a way to circumvent that
     * Using this method allows us to bind/unbind textures only when needed, resulting is superior performance ;D
     */
    apply() {
        this.scene.setAmbient(this.ambient[0], this.ambient[1], this.ambient[2], this.ambient[3]);
        this.scene.setDiffuse(this.diffuse[0], this.diffuse[1], this.diffuse[2], this.diffuse[3]);
        this.scene.setSpecular(this.specular[0], this.specular[1], this.specular[2], this.specular[3]);
        this.scene.setShininess(this.shininess);
        this.scene.setEmission(this.emission[0], this.emission[1], this.emission[2], this.emission[3]);
    }
}