//Flipper

var flipper = 1;
function doFlip() { 
    flipper *= -1;
}

var font = false;
function drawAALine(angle, len, color, text) {
    var origin = Entity.GetProp(Entity.GetLocalPlayer(), "DT_BaseEntity", "m_vecOrigin");
    
    var angleRad = angle * (Math.PI / 180);
    var endPos = [origin[0], origin[1], origin[2]];
    endPos[0] += Math.cos(angleRad) * len;
    endPos[1] += Math.sin(angleRad) * len;
    
    var originScreen = Render.WorldToScreen(origin);
    var endScreen = Render.WorldToScreen(endPos);
    
    Render.Line(originScreen[0], originScreen[1], endScreen[0], endScreen[1], color);
    Render.String(endScreen[0]+1, endScreen[1]+1, 1, text, [0,0,0,255], font);
    Render.String(endScreen[0], endScreen[1], 1, text, color, font);
}

var lastMove = false; // If we were moving last tick
var low = false; // Low delta
var ticker = 12; // Ticker for timing
function run() {
    ticker++;
    var v = Entity.GetProp(Entity.GetLocalPlayer(), "DT_CSPlayer", "m_vecVelocity[0]");
    var speed = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    var shouldSwitch = (speed > 1) != lastMove;
    var crouch = Entity.GetProp(Entity.GetLocalPlayer(), "CCSPlayer", "m_flDuckAmount") > 0.3;
    
    var deviator = Math.round(Globals.Realtime()*300) % 100;
    deviator /= 1000;
    var mult = flipper;

    // Helps prevent side logging
    if (shouldSwitch && deviator > 0.3) {
        flipper *= -1;
        if (deviator > 0.5) {
            low = !low;
        }
    }
    
    AntiAim.SetOverride(1);
    if (speed < 1) { // Standing AA
        AntiAim.SetLBYOffset(-58 * mult + deviator*6*mult);
        AntiAim.SetRealOffset(-9 * mult);
        AntiAim.SetFakeOffset(10 * mult * deviator);
    } else { // Moving AA
        var delta = 58 * flipper; // Don't use maxdelta to prevent resolver logging
        
        // Low delta
        if (low) {
            delta /= 5;
            
            // Trick (some) resolvers into thinking we are high-delta
            // by occasionally flicking to max delta
            if (ticker % 20 == 0) {
                delta *= 5; // This should trigger animlayer check (not sure tho)
            }
        }
        
        AntiAim.SetRealOffset(delta);
        AntiAim.SetFakeOffset(-delta/2);
    }
    
    lastMove = speed > 12; // Set move for next tick
}

Cheat.RegisterCallback("bullet_impact", "doFlip");
Cheat.RegisterCallback("CreateMove", "run");
//Jitter

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function antiaim(){
    jvalue = getRandomInt(getRandomInt(-25, 30), getRandomInt(-12, 17));
 
    setJitter(jvalue);
}
 
function setJitter(jvalue){
    UI.SetValue(["Rage", "Anti Aim", "Directions", "Jitter offset"], jvalue);
}
 
Cheat.RegisterCallback("CreateMove", "antiaim");

// Catalog

Cheat.PrintChat("Made by PunPun");
Cheat.PrintChat("Updated 6/21/2021");
Cheat.PrintChat("Catalog");
Cheat.PrintChat("Added Homosexuality Chance");
Cheat.PrintChat("Added Alternate AA");
Cheat.PrintChat("Added Safer Jitter");

//Anti Brute Force

UI.AddSubTab(["Rage", "SUBTAB_MGR"], "Avoid");
UI.AddCheckbox(["Rage", "Avoid", "Avoid"], "Anti bruteforce");

function radian(degree)
{
    return degree * Math.PI / 180.0;
}
function ExtendVector(vector, angle, extension)
{
    var radianAngle = radian(angle);
    return [extension * Math.cos(radianAngle) + vector[0], extension * Math.sin(radianAngle) + vector[1], vector[2]];
}
function VectorAdd(a, b)
{
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function VectorSubtract(a, b)
{
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function VectorMultiply(a, b)
{
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}
function VectorLength(x, y, z)
{
    return Math.sqrt(x * x + y * y + z * z);
}
function VectorNormalize(vec)
{
    var length = VectorLength(vec[0], vec[1], vec[2]);
    return [vec[0] / length, vec[1] / length, vec[2] / length];
}

function VectorDot(a, b)
{
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function VectorDistance(a, b)
{
    return VectorLength(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function ClosestPointOnRay(target, rayStart, rayEnd)
{
    var to = VectorSubtract(target, rayStart);
    var dir = VectorSubtract(rayEnd, rayStart);
    var length = VectorLength(dir[0], dir[1], dir[2]);
    dir = VectorNormalize(dir);
    var rangeAlong = VectorDot(dir, to);
    if (rangeAlong < 0.0)
    {
        return rayStart;
    }
    if (rangeAlong > length)
    {
        return rayEnd;
    }
    return VectorAdd(rayStart, VectorMultiply(dir, [rangeAlong, rangeAlong, rangeAlong]));
}
var lastHitTime = 0.0;
var lastImpactTimes =
[
    0.0
];
var lastImpacts =
[
    [0.0, 0.0, 0.0]
];
function OnHurt()
{
    if (!UI.GetValue(["Rage", "Avoid", "Avoid", "Anti bruteforce"])) return;
    if (Entity.GetEntityFromUserID(Event.GetInt("userid")) !== Entity.GetLocalPlayer()) return;
        var hitbox = Event.GetInt('hitgroup');
        if (hitbox == 1 || hitbox == 6 || hitbox == 7) 
        {
            var curtime = Global.Curtime();
            if (Math.abs(lastHitTime - curtime) > 0.5) 
            {
                lastHitTime = curtime;
                UI.ToggleHotkey(["Rage", "Anti Aim", "General", "Key assignment", "AA Direction inverter"])
                //Cheat.PrintChat("\x04 [Avpod	] \x02On Hit Anti Avoid\n")
            }
        }
   
   
}
function OnBulletImpact()
{
    if (!UI.GetValue(["Rage", "Avoid", "Avoid", "Anti bruteforce"])) return;
    var curtime = Global.Curtime();
    if (Math.abs(lastHitTime - curtime) < 0.5) return;
    var entity = Entity.GetEntityFromUserID(Event.GetInt("userid"));
    var impact = [Event.GetFloat("x"), Event.GetFloat("y"), Event.GetFloat("z"), curtime];
    var source;
    if (Entity.IsValid(entity) && Entity.IsEnemy(entity))
    {
        if (!Entity.IsDormant(entity))
        {
            source = Entity.GetEyePosition(entity);
        }
        else if (Math.abs(lastImpactTimes[entity] - curtime) < 0.1)
        {
            source = lastImpacts[entity];
        }
        else
        {
            lastImpacts[entity] = impact;
            lastImpactTimes[entity] = curtime;
            return;
        }
        var local = Entity.GetLocalPlayer();
        var localEye = Entity.GetEyePosition(local);
        var localOrigin = Entity.GetProp(local, "CBaseEntity", "m_vecOrigin");
        var localBody = VectorMultiply(VectorAdd(localEye, localOrigin), [0.5, 0.5, 0.5]);
        var bodyVec = ClosestPointOnRay(localBody, source, impact);
        var bodyDist = VectorDistance(localBody, bodyVec);
       
        if (bodyDist < 85.0)
        {
            var realAngle = Local.GetRealYaw();
            var fakeAngle = Local.GetFakeYaw();
            var headVec = ClosestPointOnRay(localEye, source, impact);
            var headDist = VectorDistance(localEye, headVec);
            var feetVec = ClosestPointOnRay(localOrigin, source, impact);
            var feetDist = VectorDistance(localOrigin, feetVec);
            var closestRayPoint;
            var realPos;
            var fakePos;
            if (bodyDist < headDist && bodyDist < feetDist)
            {             
                closestRayPoint = bodyVec;
                realPos = ExtendVector(bodyVec, realAngle + 180.0, 10.0);
                fakePos = ExtendVector(bodyVec, fakeAngle + 180.0, 10.0);
            }
            else if (feetDist < headDist) 
            {                          
                closestRayPoint = feetVec;
                var realPos1 = ExtendVector(bodyVec, realAngle - 30.0 + 60.0, 10.0);
                var realPos2 = ExtendVector(bodyVec, realAngle - 30.0 - 60.0, 10.0);
                var fakePos1 = ExtendVector(bodyVec, fakeAngle - 30.0 + 60.0, 10.0);
                var fakePos2 = ExtendVector(bodyVec, fakeAngle - 30.0 - 60.0, 10.0);
                if (VectorDistance(feetVec, realPos1) < VectorDistance(feetVec, realPos2))
                {
                    realPos = realPos1;
                }
                else
                {
                    realPos = realPos2;
                }
                if (VectorDistance(feetVec, fakePos1) < VectorDistance(feetVec, fakePos2))
                {
                    fakePos = fakePos1;
                }
                else
                {
                    fakePos = fakePos2;
                }
            }
            else                          
            {
                closestRayPoint = headVec;
                realPos = ExtendVector(bodyVec, realAngle, 10.0);
                fakePos = ExtendVector(bodyVec, fakeAngle, 10.0);
            }
            headDist = headDist.toFixed(1);
            if (VectorDistance(closestRayPoint, fakePos) < VectorDistance(closestRayPoint, realPos))
            {
                lastHitTime = curtime;
                UI.ToggleHotkey(["Rage", "Anti Aim", "General", "Key assignment", "AA Direction inverter"])
                //Cheat.PrintChat("\x04 [Avoid 1.2.1] "+headDist+"\n")
            }
        }
        lastImpacts[entity] = impact;
        lastImpactTimes[entity] = curtime;
    }
}

Cheat.RegisterCallback("player_hurt", "OnHurt");
Cheat.RegisterCallback("bullet_impact", "OnBulletImpact");

//Clantag

var lasttime = 0;
UI.AddCheckbox(["Rage", "Avoid", "Avoid"], "Clantag")
if(UI.GetValue ["Rage", "Avoid", "Avoid"], "Clantag")
function onRender( )
{
var tag = UI.GetValue( ["Rage", "Avoid", "Avoid", "Clantag"]);
var speed = 2;
var time = parseInt((Globals.Curtime() * speed))
if (time != lasttime)
{

if(tag == 1)
{
switch((time) % 23)
{
case 1: { Local.SetClanTag(" "); break; }
case 2: { Local.SetClanTag("!"); break; }
case 3: { Local.SetClanTag("!D"); break; }
case 4: { Local.SetClanTag("!DI"); break; }
case 5: { Local.SetClanTag("!DIO"); break; }
case 6: { Local.SetClanTag("!DIOV"); break; }
case 7: { Local.SetClanTag("!DIOVA"); break; }
case 8: { Local.SetClanTag("⚠⚠⚠"); break; }
case 9: { Local.SetClanTag("A⚠⚠⚠"); break; }
case 10: { Local.SetClanTag("AV⚠⚠⚠"); break; }
case 11: { Local.SetClanTag("AVO⚠⚠"); break; }
case 12: { Local.SetClanTag("AVOI⚠️"); break; }
case 13: { Local.SetClanTag("AVOID⚠"); break; }
case 14: { Local.SetClanTag("AVOID!"); break; }
case 15: { Local.SetClanTag("AVOID⚠️"); break; }
case 16: { Local.SetClanTag("AVOID!"); break; }
case 17: { Local.SetClanTag("⚠VOID⚠"); break; }
case 18: { Local.SetClanTag("⚠️OI⚠"); break; }
case 19: { Local.SetClanTag("⚠⚠⚠"); break; }
case 20: { Local.SetClanTag("⚠⚠"); break; }
case 21: { Local.SetClanTag("⚠️"); break; }
case 22: { Local.SetClanTag(" "); break; }
}
}
else
{
Local.SetClanTag(" ");
}
}
lasttime = time;
}

Cheat.RegisterCallback("Draw", "onRender");

// UI Values 

UI.SetValue(["Rage", "Anti Aim", "Directions", "Yaw offset"], -6)


// Fake Lag

UI.AddCheckbox(["Rage", "Avoid","Avoid"], "Avoid Fake Lag")
UI.AddSliderInt(["Rage", "Avoid","Avoid"], "Minimum Value", 1, 14)
UI.AddSliderInt(["Rage", "Avoid","Avoid"], "Maximum Value", 1, 14)
function UTA() {
    var lag_value = UI.GetValue(["Rage", "Fake Lag", "Fake Lag", "Limit"])
    var min_value = UI.GetValue(["Rage", "Avoid","Avoid", "Minimum Value"])
    var max_value = UI.GetValue(["Rage", "Avoid","Avoid", "Maximum Value"])
    if (UI.GetValue(["Rage", "Avoid","Avoid", "Avoid Fake Lag"])) {
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Minimum Value", true)
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Maximum Value", true)
        if (lag_value >= min_value) {
            lag_value -= 1
            UI.SetValue(["Rage", "Fake Lag", "Fake Lag", "Limit"], lag_value)
        }
        if (lag_value < min_value) {
            UI.SetValue(["Rage", "Fake Lag", "Fake Lag", "Limit"], max_value)
        }
    } else {
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Minimum Value", false)
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Maximum Value", false)
    }
}

Cheat.RegisterCallback("CreateMove", "UTA")

//Fake Lag Jitter

UI.AddCheckbox(["Rage", "Avoid","Avoid"], "Avoid Fake Lag Jitter")
UI.AddSliderInt(["Rage", "Avoid","Avoid"], "Minimum JValue", 0, 100)
UI.AddSliderInt(["Rage", "Avoid","Avoid"], "Maximum JValue", 0, 100)
function ULA() {
    var lag_value = UI.GetValue(["Rage", "Fake Lag", "Fake Lag", "Jitter"])
    var min_value = UI.GetValue(["Rage", "Avoid","Avoid", "Minimum JValue"])
    var max_value = UI.GetValue(["Rage", "Avoid","Avoid", "Maximum JValue"])
    if (UI.GetValue(["Rage", "Avoid","Avoid", "Avoid Fake Lag Jitter"])) {
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Minimum JValue", true)
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "Maximum JValue", true)
        if (lag_value >= min_value) {
            lag_value -= 1
            UI.SetValue(["Rage", "Fake Lag", "Fake Lag", "Jitter"], lag_value)
        }
        if (lag_value < min_value) {
            UI.SetValue(["Rage", "Fake Lag", "Fake Lag", "Jitter"], max_value)
        }
    } else {
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "JMinimum Value", false)
        UI.SetEnabled(["Rage", "Avoid","Avoid"], "JMaximum Value", false)
    }
}

Cheat.RegisterCallback("CreateMove", "ULA")

//Desync
UI.AddSubTab(["Rage", "SUBTAB_MGR"], "Avoid v2");
UI.AddCheckbox(["Rage","Avoid v2", "Avoid v2"],"Homosexual Mode");
UI.AddCheckbox(["Rage","Avoid v2", "Avoid v2"],"Make the voices stop");
UI.AddCheckbox(["Rage","Avoid v2", "Avoid v2"],"Trap Mode");
UI.AddSliderInt(["Rage" , "Avoid v2", "Avoid v2"],"Homosexuality Chance", 0 , 101);

Cheat.RegisterCallback("CreateMove", "aaIf");
dyn = 0;
multiplierOptions = [-1, 1, 1, -1];
mult = [1, -1, -2, 1];

function aaIf(){
    if(UI.GetValue(["Rage","Avoid v2", "Avoid v2", "Trap Mode"]) && (get_velocity() < 80) && (get_velocity() != 0)){
        aaLoop()
    }else if(!UI.GetValue(["Rage","Avoid v2", "Avoid v2", "Trap Mode"])){
        aaLoop()
    }else{
        AntiAim.SetOverride(1);
        AntiAim.SetFakeOffset(20);
        AntiAim.SetRealOffset(-40);
    }
}

function aaLoop() {
    if(UI.GetValue(["Rage","Avoid v2", "Avoid v2", "Homosexual Mode"])){
        var ran = UI.GetValue(["Rage","Avoid v2", "Avoid v2","Homosexuality Chance"]);
        offset = intRandom(0, ran)
        AntiAim.SetOverride(1);
        
        if(!UI.GetValue(["Rage","Avoid v2", "Avoid v2", "Make the voices stop"])){
            AntiAim.SetFakeOffset(offset * .1 * mult[dyn]);
            AntiAim.SetRealOffset(offset * multiplierOptions[dyn]);
        }else{
            AntiAim.SetFakeOffset(offset * multiplierOptions[dyn]);
            AntiAim.SetRealOffset(offset * mult[dyn]);
        }
        dyn++;
        if(dyn == mult.length) {
            dyn = 0;
        }
    }
}

function intRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_velocity() {
    const me = Entity.GetLocalPlayer();
    velocity = getEntitySpeed(me);
    return velocity;
}

function getEntitySpeed( entity ) {
    // Get the velocity vector.
    const velocity = Entity.GetProp( entity, "CBasePlayer", "m_vecVelocity[0]" );
    
    // Calculate speed and return it.
    return Math.sqrt( velocity[ 0 ] * velocity[ 0 ] + velocity[ 1 ] * velocity[ 1 ] );
}
// Legit
function aa_type (A,B,C){
    UI.SetValue(["Config","Cheat","General","Restrictions"],A);
    UI.SetValue(["Rage","Anti Aim","General","Pitch mode"],B);
    UI.SetValue(["Rage","Anti Aim","Directions","Yaw offset"],C);
}
//vars.
const globaltime = Globals.Realtime();
var E = true;
// ONLY E!!!!!!!!!!!!!!!!
Cheat.ExecuteCommand("unbind use");
Cheat.ExecuteCommand("bind e +use");
//using aa_type to set up legit aa while holding e
//Using a limit to how fast we can spam e, because you can get kicked for spamming commands
function main (){
    if (Input.IsKeyPressed(69) == true ){
        aa_type(0,0,180);
        E = false;
        if(Globals.Realtime() >= globaltime + 0.2){
            if(E == false){
                Cheat.ExecuteCommand("+use");
                E = true;
            }
            if(E == true){
                Cheat.ExecuteCommand("-use");
            }
        }
    }else{
        if(E == true){
            Cheat.ExecuteCommand("-use");
            E = false;
        }
        aa_type(1,1,0);
        globaltime = Globals.Realtime();
    }
}
Cheat.RegisterCallback("Draw","main");
// Shot

cocklock = 0
cocktime = 0

function COCK () {
    if (Ragebot.GetTargets() == "" && cocklock == 0) {
        UI.SetValue( ["Misc.", "Helpers", "General", "Extended backtracking"], 0)
    }
    else if (Ragebot.GetTargets() != "") {
        cocklock = 1
        cocktime = Globals.Realtime()
    }
    
    if (cocklock == 1) {
        UI.SetValue( ["Misc.", "Helpers", "General", "Extended backtracking"], 1)
        if (cocktime + 1 < Globals.Realtime()) {
            cocklock = 0
        }
    }
}

Cheat.RegisterCallback("CreateMove", "COCK")