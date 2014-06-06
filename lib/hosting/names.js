function Names(name1, name2)
{
    this.name1 = name1;
    this.name2 = name2;
}

Names.prototype.getMapKey = function()
{
    return this.name1 + this.name2;
}

Names.prototype.equals = function(other)
{
    return this.name1 === other.name1 && this.name2 === other.name2;
}

module.exports = Names;
